-- Set payment_receipt_cleanup_url in Vault to this project's base URL before applying.
-- Deploy cleanup-payment-receipts before enabling this schedule.
begin;
create extension if not exists pg_cron;

do $$ begin
  if not exists (select 1 from vault.decrypted_secrets
    where name = 'payment_receipt_cleanup_url' and decrypted_secret ~ '^https://[a-z]{20}\.supabase\.co$') then
    raise exception 'Set payment_receipt_cleanup_url in Supabase Vault to this project URL before scheduling cleanup.';
  end if;
  if not exists (select 1 from vault.secrets where name = 'payment_receipt_cleanup_token') then
    perform vault.create_secret(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'payment_receipt_cleanup_token');
  end if;
end $$;

select cron.schedule('cleanup-payment-receipts', '17 * * * *', $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'payment_receipt_cleanup_url') || '/functions/v1/cleanup-payment-receipts',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cleanup-token', (select decrypted_secret from vault.decrypted_secrets where name = 'payment_receipt_cleanup_token')),
    body := '{}'::jsonb, timeout_milliseconds := 60000
  );
$job$);
commit;
