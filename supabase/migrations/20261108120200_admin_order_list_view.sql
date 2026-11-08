-- The admin table pages on the server instead of downloading every order. The
-- returning-customer count must still cover all orders, so it is computed here:
-- orders by the same phone up to and including this one (ties count together).
-- security_invoker keeps the orders RLS policies, so only admins see rows.
-- orders.* is expanded at creation: recreate the view after adding order columns.
create or replace view public.admin_order_list with (security_invoker = true) as
select orders.*, count(*) over (partition by orders.phone order by orders.created_at) as customer_order_count
from public.orders;
revoke all on public.admin_order_list from public, anon;
grant select on public.admin_order_list to authenticated;
