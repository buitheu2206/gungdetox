-- Apply in a transaction after payment-receipt-confirmation.sql, before deploying the new client.
begin;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
insert into public.admin_users(user_id)
select id from auth.users where email in ('buitheu698@gmail.com', 'chubaohong2206@gmail.com', 'hoabachhop79@gmail.com')
on conflict do nothing;
do $$ begin
  if (select count(*) from public.admin_users) < 3 then
    raise exception 'Create the three approved admin Auth accounts before applying harden-orders.sql.';
  end if;
end $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.admin_users where user_id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Replace permissive policies, including any older copies with different names.
do $$ declare policy record; target text; begin
  for policy in select tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('orders', 'products', 'posts')
  loop execute format('drop policy %I on public.%I', policy.policyname, policy.tablename); end loop;
  foreach target in array array['products', 'posts'] loop
    execute format('create policy public_read on public.%I for select using (true)', target);
    execute format('create policy admin_write on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', target);
  end loop;
end $$;
create policy admin_orders on public.orders for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
-- Creation always goes through the validating RPC, even for admins.
revoke insert on public.orders from anon, authenticated;
revoke select, update, delete on public.orders from anon;
grant select, update, delete on public.orders to authenticated;

alter table public.orders add column if not exists delivery_date date;
alter table public.orders add column if not exists delivery_time text;
alter table public.orders add column if not exists delivery_note text;
alter table public.orders add column if not exists is_deposit boolean;
create index if not exists orders_created_id_idx on public.orders(created_at desc, id);
create index if not exists orders_phone_idx on public.orders(phone);

create or replace function public.create_order_with_receipt(order_data jsonb, upload_token uuid)
returns setof public.orders language plpgsql security definer set search_path = ''
as $$
declare
  created_order public.orders;
  item jsonb;
  product public.products;
  checked_items jsonb := '[]'::jsonb;
  quantity numeric;
begin
  if upload_token is null or jsonb_typeof(order_data) is distinct from 'object'
    or coalesce(order_data->>'phone', '') !~ '^0[0-9]{9}$'
    or coalesce(btrim(order_data->>'customer_name'), '') = ''
    or coalesce(btrim(order_data->>'address'), '') = ''
    or coalesce(btrim(order_data->>'district'), '') = ''
    or jsonb_typeof(order_data->'items') is distinct from 'array'
    or coalesce((order_data->>'bottles_returned')::integer, 0) < 0 then
    raise exception 'Thông tin đơn hàng không hợp lệ.';
  end if;
  if jsonb_array_length(order_data->'items') = 0 then raise exception 'Đơn hàng phải có sản phẩm.'; end if;
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
  insert into public.orders (
    phone, customer_name, address, district, items, bottle_type, bottles_returned,
    payment_method, shipping_fee_note, paid, status, delivery_date, delivery_time, delivery_note, is_deposit
  ) values (
    order_data->>'phone', btrim(order_data->>'customer_name'), order_data->>'address', order_data->>'district',
    checked_items, order_data->>'bottle_type', coalesce((order_data->>'bottles_returned')::integer, 0),
    order_data->>'payment_method', order_data->>'shipping_fee_note', false, 'processing',
    nullif(order_data->>'delivery_date', '')::date, order_data->>'delivery_time', order_data->>'delivery_note',
    coalesce((order_data->>'is_deposit')::boolean, false)
  ) returning * into created_order;
  insert into public.order_receipt_uploads values (created_order.id, upload_token);
  return next created_order;
end $$;
revoke all on function public.create_order_with_receipt(jsonb, uuid) from public;
grant execute on function public.create_order_with_receipt(jsonb, uuid) to anon, authenticated;

-- Only the matching order summary is public. Never return address, customer name, UUID or receipt capability.
create or replace function public.lookup_order(order_code text, customer_phone text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$ declare matches jsonb; begin
  if customer_phone is null or customer_phone !~ '^0[0-9]{9}$'
    or order_code is null or upper(order_code) !~ '^[0-9]{6}-[A-F0-9]{6}$' then return null; end if;
  select jsonb_agg(jsonb_build_object(
    'code', upper(order_code), 'status', matched.status, 'paid', matched.paid,
    'items', matched.items, 'bottles_returned', matched.bottles_returned, 'created_at', matched.created_at
  )) into matches from (
    select * from public.orders o where o.phone = customer_phone
      and right(o.phone, 6) || '-' || upper(left(replace(o.id::text, '-', ''), 6)) = upper(order_code)
    limit 2
  ) matched;
  if jsonb_array_length(matches) = 1 then return matches->0; end if;
  return null;
end $$;
revoke all on function public.lookup_order(text, text) from public;
grant execute on function public.lookup_order(text, text) to anon, authenticated;
commit;

