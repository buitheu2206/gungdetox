-- Run only on staging after harden-orders.sql. All fixtures and changes roll back.
begin;
select set_config('audit.admin_id', (select user_id::text from public.admin_users limit 1), true);
insert into public.products(id, slug, type, name, price_retail)
values ('e1111111-1111-4111-8111-111111111111', 'audit-test-product', 'single', 'Audit fixture', 42000);
insert into public.orders(id, phone, customer_name, address, district, items, bottle_type)
values ('e2222222-2222-4222-8222-222222222222', '0901234567', 'Audit fixture', 'Private address', 'Private district',
 '[{"productSlug":"audit-test-product","quantity":1,"unitPrice":42000}]', 'glass');

set local role anon;
do $$ declare summary jsonb; begin
  begin
    perform 1 from public.orders;
    raise exception 'FAIL: anon can read orders directly';
  exception when insufficient_privilege then null; end;
  summary := public.lookup_order('234567-E22222', '0901234567');
  if summary is null or summary->>'code' <> '234567-E22222' then raise exception 'FAIL: exact lookup missing'; end if;
  if summary ?| array['phone','customer_name','address','district','id','upload_token'] then raise exception 'FAIL: private fields leaked'; end if;
  if public.lookup_order('234567-E22222', '0911234567') is not null
    or public.lookup_order('234567-FFFFFF', '0901234567') is not null
    or public.lookup_order(null, '0901234567') is not null then raise exception 'FAIL: lookup accepted mismatched credentials'; end if;
end $$;

do $$ declare invalid_items jsonb; created public.orders; begin
  foreach invalid_items in array array['[null]'::jsonb, '[{"productSlug":"audit-test-product","quantity":0}]'::jsonb,
    '[{"productSlug":"missing","quantity":1}]'::jsonb] loop
    begin
      perform public.create_order_with_receipt(jsonb_build_object('phone','0901234567','customer_name','Test','address','Test',
        'district','Test','items',invalid_items,'bottle_type','glass','payment_method','bank_transfer'), gen_random_uuid());
      raise exception using errcode = 'ZX001', message = 'FAIL: invalid items accepted';
    exception when sqlstate 'ZX001' then raise; when others then null; end;
  end loop;
  select * into created from public.create_order_with_receipt(jsonb_build_object('phone','0901234567','customer_name','Test','address','Test',
    'district','Test','items','[{"productSlug":"audit-test-product","quantity":2,"unitPrice":1}]'::jsonb,
    'bottle_type','glass','payment_method','bank_transfer','delivery_date','2026-10-20','delivery_note','Gọi trước. Phí ship tôi trả'), gen_random_uuid());
  if created.items->0->>'unitPrice' <> '42000' or created.delivery_note <> 'Gọi trước. Phí ship tôi trả' then
    raise exception 'FAIL: price snapshot or structured delivery was lost';
  end if;
end $$;

reset role;
select set_config('request.jwt.claim.sub', 'e3333333-3333-4333-8333-333333333333', true);
set local role authenticated;
do $$ declare changed integer; begin
  if public.is_admin() then raise exception 'FAIL: unapproved user is admin'; end if;
  if exists(select 1 from public.orders) then raise exception 'FAIL: unapproved user can read orders'; end if;
  update public.products set name = 'unauthorized' where slug = 'audit-test-product';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'FAIL: unapproved user can modify products'; end if;
end $$;

reset role;
select set_config('request.jwt.claim.sub', current_setting('audit.admin_id'), true);
set local role authenticated;
do $$ declare changed integer; begin
  if not public.is_admin() then raise exception 'FAIL: approved admin denied'; end if;
  update public.orders set status = 'delivering', status_history = '[{"status":"delivering","at":"2026-10-14T00:00:00Z"}]'
  where id = 'e2222222-2222-4222-8222-222222222222' and status = 'processing' and status_history = '[]';
  get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'FAIL: first status update denied'; end if;
  update public.orders set status = 'cancelled', status_history = '[]'
  where id = 'e2222222-2222-4222-8222-222222222222' and status = 'processing' and status_history = '[]';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'FAIL: stale edit overwrote history'; end if;
end $$;
rollback;
