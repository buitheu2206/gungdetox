-- create_order_with_receipt is callable by anyone and every new order emails the
-- shop, so cap field sizes, cart size and orders per phone. A trigger keeps the
-- RPC unchanged and also covers any future insert path.
create or replace function public.limit_order_creation()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if length(new.customer_name) > 100 or length(new.address) > 300 or length(new.district) > 100
    or length(new.delivery_note) > 1000 or length(new.delivery_time) > 100
    or length(new.payment_method) > 50 or length(new.shipping_fee_note) > 2000
    or jsonb_array_length(new.items) > 30 then
    raise exception using message = 'Thông tin đơn hàng quá dài. Vui lòng rút gọn ghi chú hoặc liên hệ tiệm qua Zalo.',
      detail = 'ORDER_TOO_LARGE';
  end if;
  -- Shop days follow Vietnam time; the database clock is UTC.
  if new.delivery_date < (now() at time zone 'Asia/Ho_Chi_Minh')::date then
    raise exception using message = 'Ngày giao đã qua. Vui lòng chọn lại ngày giao.', detail = 'ORDER_PAST_DELIVERY_DATE';
  end if;
  -- Serialize per phone so parallel requests cannot all pass the count. orders_phone_idx serves the count.
  perform pg_advisory_xact_lock(hashtextextended('order-rate:' || new.phone, 0));
  if (select count(*) from public.orders
      where phone = new.phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception using message = 'Số điện thoại này vừa đặt nhiều đơn. Vui lòng thử lại sau hoặc liên hệ tiệm qua Zalo.',
      detail = 'ORDER_RATE_LIMITED';
  end if;
  return new;
end $$;
revoke all on function public.limit_order_creation() from public, anon, authenticated;

drop trigger if exists limit_order_creation on public.orders;
create trigger limit_order_creation before insert on public.orders
for each row execute function public.limit_order_creation();
