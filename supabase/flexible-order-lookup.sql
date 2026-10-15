-- Apply after defer-order-until-payment.sql. Either the order code or the phone alone is
-- now enough to look up orders — not both. A phone-only search returns every order for
-- that phone (newest first, capped); a code-only search still narrows to one order in
-- practice since the code embeds the phone's last 6 digits.
begin;

create or replace function public.lookup_order(order_code text, customer_phone text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  normalized_code text := nullif(upper(order_code), '');
  normalized_phone text := nullif(customer_phone, '');
  matches jsonb;
begin
  if normalized_code is not null and normalized_code !~ '^[0-9]{6}-[A-F0-9]{6}$' then normalized_code := null; end if;
  if normalized_phone is not null and normalized_phone !~ '^0[0-9]{9}$' then normalized_phone := null; end if;
  if normalized_code is null and normalized_phone is null then return '[]'::jsonb; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'code', right(o.phone, 6) || '-' || upper(left(replace(o.id::text, '-', ''), 6)),
    'status', o.status, 'paid', o.paid, 'items', o.items,
    'bottles_returned', o.bottles_returned, 'created_at', o.created_at
  ) order by o.created_at desc), '[]'::jsonb) into matches
  from (
    select * from public.orders o
    where (normalized_phone is null or o.phone = normalized_phone)
      and (normalized_code is null or right(o.phone, 6) || '-' || upper(left(replace(o.id::text, '-', ''), 6)) = normalized_code)
    limit 20
  ) o;

  return matches;
end $$;
revoke all on function public.lookup_order(text, text) from public;
grant execute on function public.lookup_order(text, text) to anon, authenticated;
commit;
