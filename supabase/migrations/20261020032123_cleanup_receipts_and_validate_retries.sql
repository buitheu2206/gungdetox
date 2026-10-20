-- Coordinate receipt collection with public creation, and reject changed-data retries.
begin;

-- Retired names are never reused: a delayed Storage delete cannot hit a new upload.
create table public.retired_payment_receipts (
  path text primary key,
  retired_at timestamptz not null default now(),
  deleted_at timestamptz
);
alter table public.retired_payment_receipts enable row level security;
revoke all on public.retired_payment_receipts from public, anon, authenticated;

create function public.is_payment_receipt_retired(receipt_path text)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.retired_payment_receipts where path = receipt_path) $$;
revoke all on function public.is_payment_receipt_retired(text) from public;
grant execute on function public.is_payment_receipt_retired(text) to anon, authenticated, service_role;

drop policy "Khách gửi ảnh chuyển khoản" on storage.objects;
create policy "Khách gửi ảnh chuyển khoản" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'payment-receipts'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/receipt(-[0-9a-f]{64})?$'
  and not public.is_payment_receipt_retired(name));

-- Compare customer-owned fields, ignoring server prices and operational order state.
create function public.checkout_order_details(payload jsonb)
returns jsonb language sql immutable set search_path = ''
as $$
  select jsonb_build_object(
    'phone', payload->>'phone', 'customer_name', btrim(payload->>'customer_name'),
    'address', payload->>'address', 'district', payload->>'district',
    'bottle_type', payload->>'bottle_type',
    'bottles_returned', coalesce((payload->>'bottles_returned')::integer, 0),
    'payment_method', payload->>'payment_method',
    'delivery_date', nullif(payload->>'delivery_date', ''),
    'delivery_time', coalesce(payload->>'delivery_time', ''),
    'delivery_note', coalesce(payload->>'delivery_note', ''),
    'shipping_fee_note', coalesce(payload->>'shipping_fee_note', ''),
    'is_deposit', coalesce((payload->>'is_deposit')::boolean, false),
    'items', (select jsonb_agg(jsonb_build_array(item->>'productSlug', (item->>'quantity')::numeric)
      order by item->>'productSlug', (item->>'quantity')::numeric)
      from jsonb_array_elements(payload->'items') item)
  );
$$;
revoke all on function public.checkout_order_details(jsonb) from public, anon, authenticated;

create function public.assert_receipt_cleanup_token(cleanup_token text)
returns void language plpgsql security definer set search_path = ''
as $$ begin
  if cleanup_token is null or not exists (select 1 from vault.decrypted_secrets
    where name = 'payment_receipt_cleanup_token' and decrypted_secret = cleanup_token) then
    raise exception using errcode = '28000', message = 'Unauthorized receipt cleanup request.';
  end if;
end $$;
revoke all on function public.assert_receipt_cleanup_token(text) from public, anon, authenticated;
grant execute on function public.assert_receipt_cleanup_token(text) to service_role;

-- Bounded batches retry unfinished deletes first. Files stay in Storage until the API removes them.
create function public.claim_payment_receipt_cleanup(cleanup_token text)
returns setof text language plpgsql security definer set search_path = ''
as $$
declare candidate record;
begin
  perform public.assert_receipt_cleanup_token(cleanup_token);
  for candidate in
    select retired.path, retired.retired_at as age from public.retired_payment_receipts retired
    where retired.deleted_at is null or exists (select 1 from storage.objects object
      where object.bucket_id = 'payment-receipts' and object.name = retired.path)
    union all
    select object.name, object.created_at from storage.objects object
    where object.bucket_id = 'payment-receipts' and object.created_at < now() - interval '24 hours'
      and object.name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/receipt(-[0-9a-f]{64})?$'
      and not exists (select 1 from public.retired_payment_receipts retired where retired.path = object.name)
      and not exists (select 1 from public.orders saved
        where coalesce(saved.payment_receipt_path, saved.id::text || '/receipt') = object.name)
    order by age, path limit 100
  loop
    if not pg_try_advisory_xact_lock(hashtextextended(split_part(candidate.path, '/', 1), 0)) then continue; end if;
    -- Recheck after acquiring the same lock used by create_order_with_receipt.
    if exists (select 1 from public.orders saved
      where coalesce(saved.payment_receipt_path, saved.id::text || '/receipt') = candidate.path) then continue; end if;
    insert into public.retired_payment_receipts(path) values (candidate.path) on conflict do nothing;
    return next candidate.path;
  end loop;
end $$;
revoke all on function public.claim_payment_receipt_cleanup(text) from public, anon, authenticated;
grant execute on function public.claim_payment_receipt_cleanup(text) to service_role;

create function public.complete_payment_receipt_cleanup(cleanup_token text, receipt_paths text[])
returns integer language plpgsql security definer set search_path = ''
as $$
begin
  perform public.assert_receipt_cleanup_token(cleanup_token);
  update public.retired_payment_receipts retired set deleted_at = now()
  where retired.path = any(receipt_paths) and retired.deleted_at is null
    and not exists (select 1 from storage.objects object
      where object.bucket_id = 'payment-receipts' and object.name = retired.path);
  return (select count(*)::integer from public.retired_payment_receipts retired
    where retired.path = any(receipt_paths) and retired.deleted_at is not null
      and not exists (select 1 from storage.objects object
        where object.bucket_id = 'payment-receipts' and object.name = retired.path));
end $$;
revoke all on function public.complete_payment_receipt_cleanup(text, text[]) from public, anon, authenticated;
grant execute on function public.complete_payment_receipt_cleanup(text, text[]) to service_role;

create or replace function public.create_order_with_receipt(order_data jsonb, order_id uuid)
returns setof public.orders language plpgsql security definer set search_path = ''
as $$
declare
  created_order public.orders;
  item jsonb;
  product public.products;
  checked_items jsonb := '[]'::jsonb;
  quantity numeric;
  receipt_path text := coalesce(order_data->>'payment_receipt_path', order_id::text || '/receipt');
begin
  if order_id is null or jsonb_typeof(order_data) is distinct from 'object'
    or coalesce(order_data->>'phone', '') !~ '^0[0-9]{9}$'
    or coalesce(btrim(order_data->>'customer_name'), '') = ''
    or coalesce(btrim(order_data->>'address'), '') = ''
    or coalesce(btrim(order_data->>'district'), '') = ''
    or jsonb_typeof(order_data->'items') is distinct from 'array'
    or coalesce((order_data->>'bottles_returned')::integer, 0) < 0 then
    raise exception 'Thông tin đơn hàng không hợp lệ.';
  end if;
  if jsonb_array_length(order_data->'items') = 0 then raise exception 'Đơn hàng phải có sản phẩm.'; end if;

  -- Cleanup and creation serialize only for this checkout, never for the whole shop.
  perform pg_advisory_xact_lock(hashtextextended(order_id::text, 0));
  if public.is_payment_receipt_retired(receipt_path) then
    raise exception 'Ảnh cũ đã được dọn. Vui lòng bấm xác nhận lại để gửi một phiên bản ảnh mới.';
  end if;
  select * into created_order from public.orders where id = order_id;
  if found then
    if public.checkout_order_details(order_data) is distinct from public.checkout_order_details(to_jsonb(created_order)) then
      raise exception using message = 'Đơn hàng đã được ghi nhận trước đó. Thông tin vừa sửa chưa được lưu. Vui lòng liên hệ tiệm qua Zalo hoặc hotline để điều chỉnh.',
        detail = 'ORDER_ALREADY_CREATED_WITH_DIFFERENT_DETAILS';
    end if;
    if coalesce(created_order.payment_receipt_path, order_id::text || '/receipt') <> receipt_path then
      raise exception 'Đơn hàng đã được ghi nhận với ảnh khác. Vui lòng tra cứu đơn hoặc liên hệ tiệm để đổi ảnh.';
    end if;
    -- Anonymous creation retries acknowledge success without exposing order details.
    return next jsonb_populate_record(null::public.orders, jsonb_build_object(
      'id', created_order.id, 'payment_receipt_path', coalesce(created_order.payment_receipt_path, receipt_path)));
    return;
  end if;

  for item in select value from jsonb_array_elements(order_data->'items') loop
    if jsonb_typeof(item) is distinct from 'object'
      or jsonb_typeof(item->'productSlug') is distinct from 'string'
      or jsonb_typeof(item->'quantity') is distinct from 'number' then
      raise exception 'Sản phẩm và số lượng không hợp lệ.';
    end if;
    quantity := (item->>'quantity')::numeric;
    if quantity < 1 or quantity <> trunc(quantity) or quantity > 2147483647 then
      raise exception 'Số lượng phải là số nguyên dương.';
    end if;
    select * into product from public.products where slug = item->>'productSlug';
    if not found or product.in_stock is not true then raise exception 'Sản phẩm không còn bán.'; end if;
    checked_items := checked_items || jsonb_build_array(jsonb_build_object(
      'productSlug', product.slug, 'quantity', quantity,
      'unitPrice', case when product.type = 'single' then product.price_retail else product.price end));
  end loop;

  if not public.has_payment_receipt(order_id, receipt_path) then
    raise exception 'Chưa có ảnh chuyển khoản cho đơn này. Vui lòng tải ảnh trước khi xác nhận.';
  end if;

  insert into public.orders (
    id, phone, customer_name, address, district, items, bottle_type, bottles_returned,
    payment_method, shipping_fee_note, paid, status, delivery_date, delivery_time, delivery_note,
    is_deposit, payment_receipt_submitted_at, payment_receipt_path
  ) values (
    order_id, order_data->>'phone', btrim(order_data->>'customer_name'), order_data->>'address', order_data->>'district',
    checked_items, order_data->>'bottle_type', coalesce((order_data->>'bottles_returned')::integer, 0),
    order_data->>'payment_method', order_data->>'shipping_fee_note', false, 'processing',
    nullif(order_data->>'delivery_date', '')::date, order_data->>'delivery_time', order_data->>'delivery_note',
    coalesce((order_data->>'is_deposit')::boolean, false), now(), receipt_path
  ) returning * into created_order;
  return next jsonb_populate_record(null::public.orders, jsonb_build_object(
    'id', created_order.id, 'payment_receipt_path', receipt_path));
end $$;
revoke all on function public.create_order_with_receipt(jsonb, uuid) from public;
grant execute on function public.create_order_with_receipt(jsonb, uuid) to anon, authenticated;
commit;
