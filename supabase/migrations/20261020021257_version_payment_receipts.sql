-- Immutable receipt versions let customers change images before order creation.
-- Legacy clients keep using {order_id}/receipt; existing orders remain unchanged.
begin;

alter table public.orders add column payment_receipt_path text;

-- Keep legacy paths while accepting content-addressed images. No public reads or overwrites.
drop policy "Khách gửi ảnh chuyển khoản" on storage.objects;
create policy "Khách gửi ảnh chuyển khoản" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'payment-receipts'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/receipt(-[0-9a-f]{64})?$');

create function public.has_payment_receipt(order_id uuid, receipt_path text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (receipt_path = order_id::text || '/receipt'
    or receipt_path ~ ('^' || order_id::text || '/receipt-[0-9a-f]{64}$'))
    and exists (select 1 from storage.objects
      where bucket_id = 'payment-receipts' and name = receipt_path);
$$;
revoke all on function public.has_payment_receipt(uuid, text) from public;
grant execute on function public.has_payment_receipt(uuid, text) to anon, authenticated;

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

  select * into created_order from public.orders where id = order_id;
  if found then
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
