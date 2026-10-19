-- Private transfer screenshots. Only the creator's upload capability can insert a file;
-- the three existing admins can read it. The capability is never exposed in orders.
create table public.order_receipt_uploads (
  order_id uuid primary key references public.orders(id) on delete cascade,
  upload_token uuid not null unique
);
alter table public.order_receipt_uploads enable row level security;
revoke all on public.order_receipt_uploads from anon, authenticated;

create function public.create_order_with_receipt(order_data jsonb, upload_token uuid)
returns setof public.orders
language plpgsql security definer set search_path = ''
as $$
declare
  created_order public.orders;
begin
  if upload_token is null or jsonb_typeof(order_data) is distinct from 'object'
    or coalesce(order_data->>'phone', '') !~ '^0[0-9]{9}$'
    or coalesce(btrim(order_data->>'customer_name'), '') = ''
    or coalesce(btrim(order_data->>'address'), '') = ''
    or coalesce(btrim(order_data->>'district'), '') = ''
    or jsonb_typeof(order_data->'items') is distinct from 'array'
    or coalesce((order_data->>'bottles_returned')::integer, 0) < 0 then
    raise exception 'Thông tin đơn hàng không hợp lệ. Kiểm tra thông tin người nhận và sản phẩm.';
  end if;
  if jsonb_array_length(order_data->'items') = 0 then
    raise exception 'Đơn hàng phải có ít nhất một sản phẩm.';
  end if;
  insert into public.orders (
    phone, customer_name, address, district, items, bottle_type,
    bottles_returned, payment_method, shipping_fee_note, paid, status
  ) values (
    order_data->>'phone', btrim(order_data->>'customer_name'), order_data->>'address',
    order_data->>'district', order_data->'items', order_data->>'bottle_type',
    coalesce((order_data->>'bottles_returned')::integer, 0),
    order_data->>'payment_method', order_data->>'shipping_fee_note', false, 'processing'
  ) returning * into created_order;
  insert into public.order_receipt_uploads values (created_order.id, upload_token);
  return next created_order;
end;
$$;
revoke all on function public.create_order_with_receipt(jsonb, uuid) from public;
grant execute on function public.create_order_with_receipt(jsonb, uuid) to anon, authenticated;

create function public.can_upload_payment_receipt(object_name text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.order_receipt_uploads as permission
    where object_name = permission.order_id::text || '/' || permission.upload_token::text
  );
$$;
revoke all on function public.can_upload_payment_receipt(text) from public;
grant execute on function public.can_upload_payment_receipt(text) to anon, authenticated;

create function public.has_payment_receipt(order_id uuid, upload_token uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.order_receipt_uploads as permission
    join storage.objects as receipt
      on receipt.bucket_id = 'payment-receipts'
      and receipt.name = permission.order_id::text || '/' || permission.upload_token::text
    where permission.order_id = $1 and permission.upload_token = $2
  );
$$;
revoke all on function public.has_payment_receipt(uuid, uuid) from public;
grant execute on function public.has_payment_receipt(uuid, uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-receipts', 'payment-receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Khách gửi ảnh cho đơn vừa tạo" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'payment-receipts' and public.can_upload_payment_receipt(name));

do $$
declare
  admin_ids uuid[];
begin
  select array_agg(id order by id) into admin_ids from auth.users
  where email in ('buitheu698@gmail.com', 'chubaohong2206@gmail.com', 'hoabachhop79@gmail.com');
  if coalesce(cardinality(admin_ids), 0) <> 3 then
    raise exception 'Thiếu tài khoản quản trị. Tạo đủ ba email đã xác nhận trước khi chạy migration.';
  end if;
  execute format(
    'create policy "Admin xem ảnh chuyển khoản" on storage.objects for select to authenticated using (bucket_id = %L and (select auth.uid()) = any (%L::uuid[]))',
    'payment-receipts', admin_ids
  );
end;
$$;

