-- Exercises real RPC and Storage policies; fixtures and webhook queues are rolled back.
begin;
select set_config('gungdetox.receipt_admins', (
  select jsonb_agg(id)::text from auth.users
  where email in ('buitheu698@gmail.com', 'chubaohong2206@gmail.com', 'hoabachhop79@gmail.com')
), true);
set local role anon;
do $$
declare
  created_order public.orders;
  token uuid := gen_random_uuid();
begin
  select * into created_order from public.create_order_with_receipt(
    '{"phone":"0900000000","customer_name":"Receipt policy test","address":"Test address","district":"Test district","items":[{"productSlug":"test","quantity":1}],"bottle_type":"glass","payment_method":"bank_transfer","bottles_returned":0,"paid":true,"status":"delivered"}', token
  );
  if created_order.paid or created_order.status <> 'processing' then
    raise exception 'Checkout must not accept payment or status changes from the client.';
  end if;
  perform set_config('gungdetox.receipt_order', created_order.id::text, true);
  perform set_config('gungdetox.receipt_token', token::text, true);
  if not public.can_upload_payment_receipt(created_order.id::text || '/' || token::text) then
    raise exception 'The order creator cannot upload their receipt.';
  end if;
  if public.can_upload_payment_receipt(created_order.id::text || '/' || gen_random_uuid()::text)
    or public.can_upload_payment_receipt('other-order/' || token::text) then
    raise exception 'Upload permissions accept a different order or token.';
  end if;
  begin
    perform 1 from public.order_receipt_uploads;
    raise exception 'Anonymous callers can read upload capabilities.';
  exception when insufficient_privilege then null;
  end;
  if exists (select 1 from storage.objects where bucket_id = 'payment-receipts') then
    raise exception 'Anonymous callers can list private receipts.';
  end if;
end;
$$;

do $$
declare
  receipt_path text := current_setting('gungdetox.receipt_order') || '/' || current_setting('gungdetox.receipt_token');
begin
  insert into storage.objects (bucket_id, name) values ('payment-receipts', receipt_path);
  if not public.has_payment_receipt(current_setting('gungdetox.receipt_order')::uuid, current_setting('gungdetox.receipt_token')::uuid) then
    raise exception 'The uploader cannot verify a completed upload after a lost response.';
  end if;
  if public.has_payment_receipt(current_setting('gungdetox.receipt_order')::uuid, gen_random_uuid()) then
    raise exception 'Receipt status is disclosed without the upload capability.';
  end if;
  if exists (select 1 from storage.objects where bucket_id = 'payment-receipts') then
    raise exception 'Uploading a file grants public read access.';
  end if;
  begin
    insert into storage.objects (bucket_id, name) values ('payment-receipts', gen_random_uuid()::text || '/' || gen_random_uuid()::text);
    raise exception 'Anonymous callers can upload outside their allocated path.';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name) values ('product-images', 'receipt-policy-test');
    raise exception 'Receipt upload permissions leak to product images.';
  exception when insufficient_privilege then null;
  end;
  update storage.objects set metadata = '{"overwritten":true}' where bucket_id = 'payment-receipts';
  if found then raise exception 'Anonymous callers can overwrite a receipt.'; end if;
end;
$$;

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
      and name = current_setting('gungdetox.receipt_order') || '/' || current_setting('gungdetox.receipt_token')) then
      raise exception 'An approved admin cannot read the uploaded receipt.';
    end if;
  end loop;
  if (select paid from public.orders where id = current_setting('gungdetox.receipt_order')::uuid) then
    raise exception 'Receipt upload marked the order paid.';
  end if;
end;
$$;
rollback;
select 'Payment receipt access checks passed' as result;
