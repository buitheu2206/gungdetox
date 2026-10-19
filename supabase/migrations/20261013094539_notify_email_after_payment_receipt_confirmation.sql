-- Confirm only after the private image exists; submit once without marking the order paid.
alter table public.orders add column payment_receipt_submitted_at timestamptz;

create function public.confirm_payment_receipt(order_id uuid, upload_token uuid)
returns timestamptz language plpgsql security definer set search_path = ''
as $$
declare
  submitted_at timestamptz;
begin
  if not public.has_payment_receipt(order_id, upload_token) then
    raise exception 'Chưa có ảnh chuyển khoản cho đơn này hoặc thông tin xác nhận không hợp lệ.';
  end if;
  update public.orders as customer_order set payment_receipt_submitted_at = now()
  where customer_order.id = $1 and customer_order.payment_receipt_submitted_at is null
  returning customer_order.payment_receipt_submitted_at into submitted_at;
  if submitted_at is null then
    select customer_order.payment_receipt_submitted_at into submitted_at
    from public.orders as customer_order where customer_order.id = $1;
  end if;
  return submitted_at;
end;
$$;
revoke all on function public.confirm_payment_receipt(uuid, uuid) from public;
grant execute on function public.confirm_payment_receipt(uuid, uuid) to anon, authenticated;

-- Reuse the existing server-side webhook arguments without exposing its secret to clients/logs.
do $$
declare
  trigger_definition text;
begin
  select pg_get_triggerdef(oid) into trigger_definition from pg_trigger
  where tgname = 'notify_new_order_email' and tgrelid = 'public.orders'::regclass;
  if trigger_definition is null then
    raise exception 'Thiếu webhook email hiện tại. Cấu hình notify_new_order_email trước khi đổi thời điểm gửi.';
  end if;
  trigger_definition := replace(trigger_definition,
    'CREATE TRIGGER notify_new_order_email AFTER INSERT',
    'CREATE TRIGGER notify_order_receipt_email AFTER UPDATE OF payment_receipt_submitted_at');
  trigger_definition := replace(trigger_definition, 'FOR EACH ROW EXECUTE FUNCTION',
    'FOR EACH ROW WHEN (OLD.payment_receipt_submitted_at IS NULL AND NEW.payment_receipt_submitted_at IS NOT NULL) EXECUTE FUNCTION');
  if trigger_definition not like '%AFTER UPDATE OF payment_receipt_submitted_at%' then
    raise exception 'Webhook email có cấu trúc khác dự kiến. Kiểm tra trigger trước khi chuyển đổi.';
  end if;
  alter table public.orders disable trigger notify_new_order_email;
  execute trigger_definition;
end;
$$;

