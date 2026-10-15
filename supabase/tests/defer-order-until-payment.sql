-- Exercises the new RPC, storage policy and email timing. Fixtures and the webhook queue
-- are rolled back.
begin;
insert into public.products(slug, type, name, price_retail) values ('audit-receipt-fixture', 'single', 'Receipt test fixture', 42000);
select set_config('gungdetox.receipt_admins', (
  select jsonb_agg(id)::text from auth.users
  where email in ('buitheu698@gmail.com', 'chubaohong2206@gmail.com', 'hoabachhop79@gmail.com')
), true);
select set_config('gungdetox.queued_emails', (select count(*)::text from net.http_request_queue), true);
select set_config('gungdetox.new_order', gen_random_uuid()::text, true);

set local role anon;
do $$
begin
  perform public.create_order_with_receipt(
    '{"phone":"0900000000","customer_name":"Receipt policy test","address":"Test address","district":"Test district","items":[{"productSlug":"audit-receipt-fixture","quantity":1}],"bottle_type":"glass","payment_method":"bank_transfer","bottles_returned":0}',
    current_setting('gungdetox.new_order')::uuid);
  raise exception 'Creating an order without a stored receipt must fail.';
exception when raise_exception then
  if sqlerrm = 'Creating an order without a stored receipt must fail.' then raise; end if;
end;
$$;

do $$
begin
  insert into storage.objects (bucket_id, name) values ('payment-receipts', 'not-a-uuid/receipt');
  raise exception 'Anonymous callers can upload to a path that is not a reserved order id.';
exception when insufficient_privilege then null;
end;
$$;

insert into storage.objects (bucket_id, name) values ('payment-receipts', current_setting('gungdetox.new_order') || '/receipt');

do $$
declare
  created_order public.orders;
  retried_order public.orders;
begin
  select * into created_order from public.create_order_with_receipt(
    '{"phone":"0900000000","customer_name":"Receipt policy test","address":"Test address","district":"Test district","items":[{"productSlug":"audit-receipt-fixture","quantity":1}],"bottle_type":"glass","payment_method":"bank_transfer","bottles_returned":0}',
    current_setting('gungdetox.new_order')::uuid);
  if created_order.paid or created_order.status <> 'processing' or created_order.payment_receipt_submitted_at is null then
    raise exception 'Creating an order with a stored receipt must record it unpaid, processing, with the receipt timestamp set.';
  end if;
  -- Retry with different order_data: must return the existing row, not a second insert or an error.
  select * into retried_order from public.create_order_with_receipt(
    '{"phone":"0900000000","customer_name":"Changed on retry","address":"Test address","district":"Test district","items":[{"productSlug":"audit-receipt-fixture","quantity":1}],"bottle_type":"glass","payment_method":"bank_transfer","bottles_returned":0}',
    current_setting('gungdetox.new_order')::uuid);
  if retried_order.customer_name <> created_order.customer_name then
    raise exception 'A retry must return the original order, not create or change one.';
  end if;
end;
$$;

reset role;
do $$
begin
  if (select count(*) from public.orders where id = current_setting('gungdetox.new_order')::uuid) <> 1 then
    raise exception 'A retry must not duplicate the order.';
  end if;
  if (select count(*) from net.http_request_queue) <> current_setting('gungdetox.queued_emails')::bigint + 1 then
    raise exception 'Creating an order with a receipt must queue exactly one email.';
  end if;
  update public.orders set status = 'delivering' where id = current_setting('gungdetox.new_order')::uuid;
  if (select count(*) from net.http_request_queue) <> current_setting('gungdetox.queued_emails')::bigint + 1 then
    raise exception 'Updating delivery status must not queue another email.';
  end if;
end;
$$;

set local role anon;
do $$ begin
  if exists (select 1 from storage.objects where bucket_id = 'payment-receipts') then
    raise exception 'Anonymous callers can list private receipts.';
  end if;
end $$;

do $$ begin
  perform 1 from public.order_receipt_uploads;
  raise exception 'order_receipt_uploads must no longer exist.';
exception when undefined_table then null;
end $$;
do $$ begin
  perform public.can_upload_payment_receipt('x');
  raise exception 'can_upload_payment_receipt must no longer exist.';
exception when undefined_function then null;
end $$;

set local role authenticated;
do $$
declare
  admin_id text;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
  if exists (select 1 from storage.objects where bucket_id = 'payment-receipts') then
    raise exception 'Non-admin authenticated users can read receipts.';
  end if;
  for admin_id in select jsonb_array_elements_text(current_setting('gungdetox.receipt_admins')::jsonb)
  loop
    perform set_config('request.jwt.claim.sub', admin_id, true);
    if not exists (select 1 from storage.objects where bucket_id = 'payment-receipts'
      and name = current_setting('gungdetox.new_order') || '/receipt') then
      raise exception 'An approved admin cannot read the uploaded receipt.';
    end if;
  end loop;
end;
$$;
rollback;
select 'Deferred order creation checks passed' as result;
