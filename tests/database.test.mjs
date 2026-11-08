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
    await database.exec(await readSql("migrations/20261020032123_cleanup_receipts_and_validate_retries.sql"));
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
    await database.exec(await readSql("migrations/20261020032123_cleanup_receipts_and_validate_retries.sql"));
    await database.exec(await readSql("flexible-order-lookup.sql"));
    await database.exec(await readSql("migrations/20261019100129_order_lookup_newest_first.sql"));
    assert.equal((await database.query("select count(*)::int as count from net.http_request_queue")).rows[0].count, 0);
  } finally {
    await database.close();
  }
});


async function createMigratedDatabase() {
  const database = new PGlite();
  await database.exec(platformSchema);
  for (const file of [
    "schema.sql", "secure-storage-policies.sql", "payment-receipts.sql", "payment-receipt-confirmation.sql", "harden-orders.sql",
    "defer-order-until-payment.sql", "migrations/20261020021257_version_payment_receipts.sql",
    "migrations/20261020032123_cleanup_receipts_and_validate_retries.sql",
    "migrations/20261108120000_storage_policies_use_admin_users.sql",
    "migrations/20261108120100_limit_anonymous_order_creation.sql",
    "migrations/20261108120200_admin_order_list_view.sql",
  ]) await database.exec(await readSql(file));
  return database;
}

// Column values are SQL expressions so tests can pass dates relative to the database clock.
function insertOrder(database, overrides = {}) {
  const columns = {
    phone: "'0901234567'", customer_name: "'Khách'", address: "'Địa chỉ'", district: "'Quận 1'",
    items: "'[]'", bottle_type: "'glass'", payment_method: "'bank_transfer'", ...overrides,
  };
  return database.exec(`insert into public.orders (${Object.keys(columns).join(", ")}) values (${Object.values(columns).join(", ")})`);
}

test("should limit storage access to the current admin_users list", async () => {
  const database = await createMigratedDatabase();
  try {
    const adminId = (await database.query("select user_id::text as id from public.admin_users limit 1")).rows[0].id;
    await database.exec(`insert into storage.objects(bucket_id, name) values ('product-images', 'a.jpg'), ('payment-receipts', 'r.jpg')`);
    const visibleFiles = async () => {
      await database.exec(`select set_config('request.jwt.claim.sub', '${adminId}', false); set role authenticated;`);
      const { rows } = await database.query("select count(*)::int as count from storage.objects");
      await database.exec("reset role");
      return rows[0].count;
    };
    assert.equal(await visibleFiles(), 2);
    await database.exec(`delete from public.admin_users where user_id = '${adminId}'`);
    assert.equal(await visibleFiles(), 0, "A removed admin must lose image and receipt access");
  } finally {
    await database.close();
  }
});

test("should reject orders that exceed the rate limit, size limits or delivery date", async () => {
  const database = await createMigratedDatabase();
  try {
    for (let i = 0; i < 5; i++) await insertOrder(database);
    await assert.rejects(insertOrder(database), /vừa đặt nhiều đơn/);
    await database.exec("delete from public.orders");
    await assert.rejects(insertOrder(database, { customer_name: `'${"a".repeat(101)}'` }), /quá dài/);
    await assert.rejects(insertOrder(database, { delivery_date: "current_date - 2" }), /Ngày giao đã qua/);
    await insertOrder(database, { delivery_date: "(now() at time zone 'Asia/Ho_Chi_Minh')::date" });
  } finally {
    await database.close();
  }
});

test("should count each customer's orders up to the row, including equal timestamps, for admins only", async () => {
  const database = await createMigratedDatabase();
  try {
    for (const [phone, createdAt] of [["0900000001", "2026-10-14"], ["0900000001", "2026-10-13"], ["0900000001", "2026-10-14"], ["0900000002", "2026-10-14"]]) {
      await insertOrder(database, { phone: `'${phone}'`, created_at: `'${createdAt}'` });
    }
    const adminId = (await database.query("select user_id::text as id from public.admin_users limit 1")).rows[0].id;
    const countsAs = async (userId) => {
      await database.exec(`select set_config('request.jwt.claim.sub', '${userId}', false); set role authenticated;`);
      const { rows } = await database.query("select phone, created_at::date::text as day, customer_order_count::int as count from public.admin_order_list order by phone, created_at");
      await database.exec("reset role");
      return rows.map((row) => `${row.phone} ${row.day} ${row.count}`);
    };
    assert.deepEqual(await countsAs(adminId), [
      "0900000001 2026-10-13 1", "0900000001 2026-10-14 3", "0900000001 2026-10-14 3", "0900000002 2026-10-14 1",
    ]);
    assert.deepEqual(await countsAs("00000000-0000-4000-8000-000000000001"), [], "Non-admins must not see orders through the view");
  } finally {
    await database.close();
  }
});
