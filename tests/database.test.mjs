import assert from "node:assert/strict";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { platformSchema, readSql } from "./helpers/database.mjs";


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
    await database.exec(await readSql("migrations/20261020021257_version_payment_receipts.sql"));
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
    await database.exec(await readSql("migrations/20261020021257_version_payment_receipts.sql"));
    await database.exec(await readSql("flexible-order-lookup.sql"));
    await database.exec(await readSql("migrations/20261019100129_order_lookup_newest_first.sql"));
    assert.equal((await database.query("select count(*)::int as count from net.http_request_queue")).rows[0].count, 0);
  } finally {
    await database.close();
  }
});
