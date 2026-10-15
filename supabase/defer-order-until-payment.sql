-- Apply after harden-orders.sql. From here on, an order is only ever written once its
-- payment receipt already exists in storage — abandoning checkout before transferring
-- leaves no row behind.
begin;

drop policy "Khách gửi ảnh cho đơn vừa tạo" on storage.objects;
create policy "Khách gửi ảnh chuyển khoản" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'payment-receipts' and name ~ '^[0-9a-f-]{36}/receipt$');

drop function public.confirm_payment_receipt(uuid, uuid);
drop function public.has_payment_receipt(uuid, uuid);
drop function public.can_upload_payment_receipt(text);
drop table public.order_receipt_uploads;

create function public.has_payment_receipt(order_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from storage.objects
    where bucket_id = 'payment-receipts' and name = order_id::text || '/receipt'
  );
$$;
revoke all on function public.has_payment_receipt(uuid) from public;
grant execute on function public.has_payment_receipt(uuid) to anon, authenticated;

-- Replaces the harden-orders.sql version: the id is now client-chosen (it is the order
-- code shown to the customer before the order exists), and creation now requires the
-- receipt to already be in storage. Idempotent, so a retry after a dropped response
-- returns the existing row instead of erroring or duplicating.
-- A plain CREATE OR REPLACE cannot rename a parameter (upload_token -> order_id) even
-- though the types are unchanged, so the old definition is dropped first.
drop function public.create_order_with_receipt(jsonb, uuid);
create function public.create_order_with_receipt(order_data jsonb, order_id uuid)
returns setof public.orders language plpgsql security definer set search_path = ''
as $$
declare
  created_order public.orders;
  item jsonb;
  product public.products;
  checked_items jsonb := '[]'::jsonb;
  quantity numeric;
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
  if found then return next created_order; return; end if;

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
    if not found or product.in_stock is false then raise exception 'Sản phẩm không còn bán.'; end if;
    checked_items := checked_items || jsonb_build_array(jsonb_build_object(
      'productSlug', product.slug, 'quantity', quantity,
      'unitPrice', case when product.type = 'single' then product.price_retail else product.price end));
  end loop;

  if not public.has_payment_receipt(order_id) then
    raise exception 'Chưa có ảnh chuyển khoản cho đơn này. Vui lòng tải ảnh trước khi xác nhận.';
  end if;

  insert into public.orders (
    id, phone, customer_name, address, district, items, bottle_type, bottles_returned,
    payment_method, shipping_fee_note, paid, status, delivery_date, delivery_time, delivery_note,
    is_deposit, payment_receipt_submitted_at
  ) values (
    order_id, order_data->>'phone', btrim(order_data->>'customer_name'), order_data->>'address', order_data->>'district',
    checked_items, order_data->>'bottle_type', coalesce((order_data->>'bottles_returned')::integer, 0),
    order_data->>'payment_method', order_data->>'shipping_fee_note', false, 'processing',
    nullif(order_data->>'delivery_date', '')::date, order_data->>'delivery_time', order_data->>'delivery_note',
    coalesce((order_data->>'is_deposit')::boolean, false), now()
  ) returning * into created_order;
  return next created_order;
end $$;
revoke all on function public.create_order_with_receipt(jsonb, uuid) from public;
grant execute on function public.create_order_with_receipt(jsonb, uuid) to anon, authenticated;

-- Email now fires at creation: every inserted order already has a confirmed receipt.
-- payment-receipt-confirmation.sql only disabled the original notify_new_order_email
-- trigger (it never dropped it) when it switched to notify_order_receipt_email, so
-- reverting is a plain drop-and-re-enable — no need to reconstruct a trigger definition.
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'notify_order_receipt_email' and tgrelid = 'public.orders'::regclass) then
    if exists (select 1 from public.orders) then
      raise exception 'Thiếu webhook email hiện tại. Cấu hình notify_order_receipt_email trước khi đổi thời điểm gửi.';
    end if;
    raise notice 'DB mới: cấu hình webhook notify_new_order_email sau bootstrap theo supabase/README.md.';
    return;
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'notify_new_order_email' and tgrelid = 'public.orders'::regclass) then
    raise exception 'Thiếu trigger notify_new_order_email gốc. Cấu hình lại webhook thủ công theo supabase/README.md.';
  end if;
  drop trigger notify_order_receipt_email on public.orders;
  alter table public.orders enable trigger notify_new_order_email;
end;
$$;
commit;
