import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

// PostgreSQL in memory: emulate only Supabase's auth/storage schema, never contact a project.
const platformSchema = `
  create role anon;
  create role authenticated;
  create schema auth;
  create schema storage;
  create table auth.users(id uuid primary key default gen_random_uuid(), email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text, metadata jsonb);
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to anon, authenticated;
  grant all on storage.objects to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  insert into auth.users(email) values ('buitheu698@gmail.com'), ('chubaohong2206@gmail.com'), ('hoabachhop79@gmail.com');
`;

const readSql = (path) => readFile(new URL(`../supabase/${path}`, import.meta.url), "utf8");

test("should bootstrap a fresh database and enforce admin, lookup and order-write boundaries", async () => {
  const database = new PGlite();
  try {
    await database.exec(platformSchema);
    for (const file of ["schema.sql", "secure-storage-policies.sql", "payment-receipts.sql", "payment-receipt-confirmation.sql", "harden-orders.sql"]) {
      await database.exec(await readSql(file));
    }
    // harden-orders.sql must be safe to reapply on its own, before any later migration
    // also touches create_order_with_receipt.
    await database.exec(await readSql("harden-orders.sql"));
    assert.equal((await database.query("select count(*)::int as count from public.admin_users")).rows[0].count, 3);
    // One-time schema change, like payment-receipt-confirmation.sql before it — not meant
    // to be rerun, so applied once here, after harden-orders.sql's own reapply check.
    await database.exec(await readSql("defer-order-until-payment.sql"));
    await database.exec(await readSql("tests/harden-orders.sql"));
    // The SQL test must clean up its fixtures.
    assert.equal((await database.query("select count(*)::int as count from public.orders")).rows[0].count, 0);
    // lookup_order's contract changes here (array return, either credential alone works),
    // so this runs after tests/harden-orders.sql, which still exercises the prior contract.
    await database.exec(await readSql("flexible-order-lookup.sql"));
    await database.exec(await readSql("migrations/20261019100129_order_lookup_newest_first.sql"));
    await database.exec(await readSql("tests/flexible-order-lookup.sql"));
    assert.equal((await database.query("select count(*)::int as count from public.orders")).rows[0].count, 0);
  } finally {
    await database.close();
  }
});


test("should preserve receipt permissions and convert the legacy webhook to one notification per confirmation", async () => {
  const database = new PGlite();
  try {
    await database.exec(platformSchema);
    for (const file of ["schema.sql", "secure-storage-policies.sql", "payment-receipts.sql"]) await database.exec(await readSql(file));
    // Model the transactional pg_net queue without sending HTTP or email.
    await database.exec(`
      create schema net;
      create table net.http_request_queue(id bigint generated always as identity);
      create function public.test_queue_email() returns trigger language plpgsql security definer as
        $$ begin insert into net.http_request_queue default values; return new; end $$;
      create trigger notify_new_order_email after insert on public.orders for each row execute function public.test_queue_email();
    `);
    await database.exec(await readSql("payment-receipt-confirmation.sql"));
    await database.exec(await readSql("harden-orders.sql"));
    await database.exec(await readSql("defer-order-until-payment.sql"));
    await database.exec(await readSql("tests/defer-order-until-payment.sql"));
    await database.exec(await readSql("flexible-order-lookup.sql"));
    await database.exec(await readSql("migrations/20261019100129_order_lookup_newest_first.sql"));
    assert.equal((await database.query("select count(*)::int as count from net.http_request_queue")).rows[0].count, 0);
  } finally {
    await database.close();
  }
});
