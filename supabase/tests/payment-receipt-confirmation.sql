-- No real email is sent: pg_net's queue and all test data are rolled back.
begin;
insert into public.products(slug, type, name, price_retail) values ('audit-receipt-fixture', 'single', 'Receipt test fixture', 42000);
select set_config('gungdetox.queued_emails', (select count(*)::text from net.http_request_queue), true);
set local role anon;
do $$
declare
  customer_order public.orders;
  token uuid := gen_random_uuid();
begin
  select * into customer_order from public.create_order_with_receipt(
    '{"phone":"0900000000","customer_name":"Confirmation policy test","address":"Test address","district":"Test district","items":[{"productSlug":"audit-receipt-fixture","quantity":1}],"bottle_type":"glass","payment_method":"bank_transfer","bottles_returned":0}', token
  );
  perform set_config('gungdetox.confirm_order', customer_order.id::text, true);
  perform set_config('gungdetox.confirm_token', token::text, true);
  begin
    perform public.confirm_payment_receipt(customer_order.id, token);
    raise exception 'Order confirmation must require a stored image.';
  exception when raise_exception then
    if sqlerrm = 'Order confirmation must require a stored image.' then raise; end if;
  end;
end;
$$;
reset role;
do $$
begin
  if (select count(*) from net.http_request_queue) <> current_setting('gungdetox.queued_emails')::bigint then
    raise exception 'Creating an unpaid order queued an email.';
  end if;
end;
$$;
set local role anon;
insert into storage.objects (bucket_id, name) values ('payment-receipts',
  current_setting('gungdetox.confirm_order') || '/' || current_setting('gungdetox.confirm_token'));
do $$
begin
  begin
    perform public.confirm_payment_receipt(current_setting('gungdetox.confirm_order')::uuid, gen_random_uuid());
    raise exception 'Confirmation accepted the wrong upload token.';
  exception when raise_exception then
    if sqlerrm = 'Confirmation accepted the wrong upload token.' then raise; end if;
  end;
  perform public.confirm_payment_receipt(current_setting('gungdetox.confirm_order')::uuid, current_setting('gungdetox.confirm_token')::uuid);
  perform public.confirm_payment_receipt(current_setting('gungdetox.confirm_order')::uuid, current_setting('gungdetox.confirm_token')::uuid);
end;
$$;
reset role;
do $$
declare
  customer_order public.orders;
begin
  if (select count(*) from net.http_request_queue) <> current_setting('gungdetox.queued_emails')::bigint + 1 then
    raise exception 'Confirmation must queue exactly one email, including on retry.';
  end if;
  select * into customer_order from public.orders where id = current_setting('gungdetox.confirm_order')::uuid;
  if customer_order.paid or customer_order.payment_receipt_submitted_at is null then
    raise exception 'Confirmation must keep payment unpaid and record the submission.';
  end if;
  update public.orders set status = 'delivering' where id = customer_order.id;
  if (select count(*) from net.http_request_queue) <> current_setting('gungdetox.queued_emails')::bigint + 1 then
    raise exception 'Updating delivery status queued another receipt email.';
  end if;
end;
$$;
rollback;
select 'Receipt confirmation and email timing checks passed' as result;
