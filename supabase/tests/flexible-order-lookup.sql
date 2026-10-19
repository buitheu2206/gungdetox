-- Exercises lookup_order accepting either the code or the phone alone. Fixtures roll back.
begin;
insert into public.products(slug, type, name, price_retail) values ('lookup-fixture', 'single', 'Lookup fixture', 42000);
insert into public.orders(id, phone, customer_name, address, district, items, bottle_type, status, created_at)
values
  ('f1111111-1111-4111-8111-111111111111', '0909876543', 'Lookup A', 'Addr', 'District',
   '[{"productSlug":"lookup-fixture","quantity":1}]', 'glass', 'processing', now() - interval '1 day'),
  ('f2222222-2222-4222-8222-222222222222', '0909876543', 'Lookup A second order', 'Addr', 'District',
   '[{"productSlug":"lookup-fixture","quantity":2}]', 'glass', 'delivered', now());

-- Insert older rows first so limiting before sorting omits the newest order.
insert into public.orders(id, phone, customer_name, address, district, items, bottle_type, created_at)
select (lpad(to_hex(n), 6, '0') || '00' || '-0000-4000-8000-000000000001')::uuid,
  '0907654321', 'Lookup limit fixture', 'Addr', 'District',
  '[{"productSlug":"lookup-fixture","quantity":1}]'::jsonb, 'glass',
  '2026-01-01'::timestamptz + (n / 2) * interval '1 day'
from generate_series(1, 24) n;

set local role anon;
do $$
declare
  by_phone jsonb := public.lookup_order(null, '0909876543');
  by_code jsonb := public.lookup_order('876543-F22222', null);
  by_both jsonb := public.lookup_order('876543-F22222', '0909876543');
begin
  if jsonb_array_length(by_phone) <> 2 then raise exception 'Phone-only lookup must return every order for that phone.'; end if;
  if by_phone->0->>'code' <> '876543-F22222' then raise exception 'Phone-only lookup must list newest orders first.'; end if;
  if jsonb_array_length(by_code) <> 1 or by_code->0->>'code' <> '876543-F22222' then
    raise exception 'Code-only lookup must return the single matching order.';
  end if;
  if jsonb_array_length(by_both) <> 1 then raise exception 'Providing both must still narrow to the matching order.'; end if;
  if (public.lookup_order(null, null)) <> '[]'::jsonb then raise exception 'Providing neither must return an empty list, not every order.'; end if;
  if jsonb_array_length(public.lookup_order(null, '0901111111')) <> 0 then
    raise exception 'A phone with no orders must return an empty list.';
  end if;
  if by_phone->0 ?| array['address', 'customer_name', 'phone'] then
    raise exception 'Lookup must never expose address, name or phone.';
  end if;
end;
$$;
reset role;
-- Exercise a sequential plan too; correctness must not depend on an index scan.
set local enable_indexscan = off;
set local enable_indexonlyscan = off;
set local enable_bitmapscan = off;
do $$
declare expected jsonb; actual jsonb;
begin
  select jsonb_agg(code order by created_at desc, id) into expected from (
    select id, created_at, right(phone, 6) || '-' || upper(left(replace(id::text, '-', ''), 6)) as code
    from public.orders where phone = '0907654321' order by created_at desc, id limit 20
  ) latest;
  set local role anon;
  select jsonb_agg(entry->>'code' order by position) into actual
  from jsonb_array_elements(public.lookup_order(null, '0907654321')) with ordinality as results(entry, position);
  if actual is distinct from expected then raise exception 'Lookup must select the newest 20 orders with deterministic ties.'; end if;
end $$;
rollback;
select 'Flexible order lookup checks passed' as result;
