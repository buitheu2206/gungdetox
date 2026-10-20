import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { ExistingOrderDetailsError, getReceiptPath, uploadPaymentReceipt } from "../src/lib/payment-receipt.ts";
import { handleReceiptCleanup } from "../supabase/functions/cleanup-payment-receipts/handler.ts";
import { createCheckoutClient, createCheckoutDatabase, queryAsCustomer } from "./helpers/checkout.mjs";
import { CLEANUP_TOKEN, createCleanupClient, queryAsCleanupService } from "./helpers/receipt-cleanup.mjs";

const ORDER_ID = "abcdef00-0000-4000-8000-000000000001";
const ABANDONED_ID = "00000000-0000-4000-8000-000000000002";
const data = {
  phone: "0900123456", customer_name: "Test customer", address: "Old address", district: "Quận 3",
  items: [{ productSlug: "ginger-shot", quantity: 1, unitPrice: 42000 }], bottle_type: "glass",
  payment_method: "bank_transfer", bottles_returned: 0, delivery_date: "2026-10-25", delivery_time: "Sáng",
  delivery_note: "Call first", shipping_fee_note: "Test shipping note", is_deposit: false,
};
const file = new File(["receipt"], "receipt.png", { type: "image/png" });
const path = getReceiptPath(ORDER_ID, createHash("sha256").update("receipt").digest("hex"));

function request(token = CLEANUP_TOKEN) {
  return new Request("https://example.com/cleanup-payment-receipts", {
    method: "POST", headers: token ? { "x-cleanup-token": token } : {},
  });
}

test("should reject every changed customer field on retry without changing the stored order or sending another email", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client, state } = createCheckoutClient(database);
  state.loseOrderResponse = true;
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, file), /Ảnh đã lưu/);
  state.loseOrderResponse = false;
  const original = (await database.query("select * from public.orders")).rows[0];
  for (const changes of [
    { phone: "0900999999" }, { customer_name: "Other customer" }, { address: "New address" }, { district: "Quận 1" },
    { items: [{ productSlug: "ginger-shot", quantity: 2 }] }, { bottle_type: "plastic" }, { bottles_returned: 1 },
    { delivery_date: "2026-10-26" }, { delivery_time: "Chiều" }, { delivery_note: "New note" },
    { payment_method: "cod" }, { is_deposit: true }, { shipping_fee_note: "Other shipping note" },
  ]) {
    await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, { ...data, ...changes }, file), ExistingOrderDetailsError);
  }
  assert.deepEqual((await database.query("select * from public.orders")).rows[0], original);
  assert.equal((await database.query("select * from net.http_request_queue")).rows.length, 1);
});

test("should allow editing before creation and identical retries after admin status or catalog price changes", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client, state } = createCheckoutClient(database);
  state.createFailure = true;
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, file));
  state.createFailure = false;
  const edited = { ...data, address: "New address" };
  await uploadPaymentReceipt(client, ORDER_ID, edited, file);
  await database.exec("update public.orders set status='delivering',paid=true; update public.products set price_retail=50000");
  await uploadPaymentReceipt(client, ORDER_ID, { ...edited, items: [{ productSlug: "ginger-shot", quantity: 1, unitPrice: 50000 }] }, file);
  const saved = (await database.query("select * from public.orders")).rows[0];
  assert.equal(saved.address, "New address");
  assert.equal(saved.items[0].unitPrice, 42000);
  assert.equal(saved.paid, true);
  assert.equal(saved.status, "delivering");
  assert.equal((await database.query("select * from net.http_request_queue")).rows.length, 1);
});

test("should remove only old unreferenced receipts and retain active, selected and legacy receipts", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client } = createCheckoutClient(database);
  await uploadPaymentReceipt(client, ORDER_ID, data, file);
  const oldUnused = getReceiptPath(ORDER_ID, "a".repeat(64));
  const abandoned = getReceiptPath(ABANDONED_ID);
  const recent = getReceiptPath(ABANDONED_ID, "b".repeat(64));
  const legacyId = "00000000-0000-4000-8000-000000000003";
  const legacyPath = getReceiptPath(legacyId);
  await database.query("insert into storage.objects(bucket_id,name,created_at) values ('payment-receipts',$1,now()-interval '2 days'),('payment-receipts',$2,now()-interval '2 days'),('payment-receipts',$3,now())",
    [oldUnused, abandoned, recent]);
  await database.exec("update storage.objects set created_at=now()-interval '2 days' where name like 'abcdef00%'");
  await database.query("insert into storage.objects(bucket_id,name,created_at) values ('payment-receipts',$1,now()-interval '2 days')", [legacyPath]);
  assert.equal((await client.rpc("create_order_with_receipt", { order_id: legacyId, order_data: data }).single()).error, null);
  await database.query("update public.orders set payment_receipt_path=null where id=$1", [legacyId]);
  const cleanup = createCleanupClient(database);
  const response = await handleReceiptCleanup(request(), cleanup.client);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { claimed: 2, deleted: 2 });
  assert.deepEqual((await database.query("select name from storage.objects order by name")).rows.map((row) => row.name).sort(), [path, recent, legacyPath].sort());
  await queryAsCustomer(database, "insert into storage.objects(bucket_id,name) values ('payment-receipts',$1)", [getReceiptPath(ABANDONED_ID, "c".repeat(64))]);
  assert.equal((await database.query("select count(*)::int as n from public.orders")).rows[0].n, 2);
  assert.equal((await database.query("select count(*)::int as n from public.retired_payment_receipts where deleted_at is not null")).rows[0].n, 2);
});

test("should reserve a receipt before deletion, recover failed deletes and use a new path for an abandoned checkout", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  await database.query("insert into storage.objects(bucket_id,name,created_at) values ('payment-receipts',$1,now()-interval '2 days')", [path]);
  const cleanup = createCleanupClient(database);
  cleanup.state.failDelete = true;
  assert.equal((await handleReceiptCleanup(request(), cleanup.client)).status, 502);
  const { client, state } = createCheckoutClient(database);
  const blocked = await client.rpc("create_order_with_receipt", { order_id: ORDER_ID, order_data: { ...data, payment_receipt_path: path } }).single();
  assert.match(blocked.error.message, /Ảnh cũ đã được dọn/);
  assert.equal((await database.query("select * from public.orders")).rows.length, 0);
  assert.equal((await queryAsCleanupService(database, "select public.complete_payment_receipt_cleanup($1,$2) as n", [CLEANUP_TOKEN, [path]])).rows[0].n, 0);
  cleanup.state.failDelete = false;
  state.loseOrderResponse = true;
  cleanup.state.beforeRemove = async () => {
    await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, file), /Ảnh đã lưu/);
  };
  assert.equal((await handleReceiptCleanup(request(), cleanup.client)).status, 200);
  cleanup.state.beforeRemove = null;
  await assert.rejects(queryAsCustomer(database, "insert into storage.objects(bucket_id,name) values ('payment-receipts',$1)", [path]), { code: "42501" });
  state.loseOrderResponse = false;
  await uploadPaymentReceipt(client, ORDER_ID, data, file);
  const saved = (await database.query("select * from public.orders")).rows[0];
  assert.notEqual(saved.payment_receipt_path, path);
  assert.equal(state.files.size, 1);
  // A delayed worker still deleting the retired name cannot affect the new receipt.
  await cleanup.client.storage.from("payment-receipts").remove([path]);
  assert.equal((await database.query("select * from storage.objects where name=$1", [saved.payment_receipt_path])).rows.length, 1);
  // Model an older in-flight upload finishing after cleanup already completed.
  await database.query("insert into storage.objects(bucket_id,name) values ('payment-receipts',$1)", [path]);
  assert.deepEqual(await (await handleReceiptCleanup(request(), cleanup.client)).json(), { claimed: 1, deleted: 1 });
  assert.equal((await database.query("select * from storage.objects where name=$1", [saved.payment_receipt_path])).rows.length, 1);
});

test("should keep a receipt when creation commits before collection and preserve the exact 24-hour boundary", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client } = createCheckoutClient(database);
  await uploadPaymentReceipt(client, ORDER_ID, data, file);
  await database.query("update storage.objects set created_at=now()-interval '2 days' where name=$1", [path]);
  await database.transaction(async (transaction) => {
    await transaction.query("insert into storage.objects(bucket_id,name,created_at) values ('payment-receipts',$1,now()-interval '24 hours')", [getReceiptPath(ABANDONED_ID)]);
    const claimed = await transaction.query("select public.claim_payment_receipt_cleanup($1) as path", [CLEANUP_TOKEN]);
    assert.deepEqual(claimed.rows, []);
  });
  assert.equal((await database.query("select * from public.retired_payment_receipts")).rows.length, 0);
});

test("should limit a cleanup run to 100 objects and finish the rest on subsequent runs", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  await database.exec("insert into storage.objects(bucket_id,name,created_at) select 'payment-receipts',gen_random_uuid()::text||'/receipt',now()-interval '2 days' from generate_series(1,105)");
  const { client } = createCleanupClient(database);
  assert.deepEqual(await (await handleReceiptCleanup(request(), client)).json(), { claimed: 100, deleted: 100 });
  assert.deepEqual(await (await handleReceiptCleanup(request(), client)).json(), { claimed: 5, deleted: 5 });
  assert.deepEqual(await (await handleReceiptCleanup(request(), client)).json(), { claimed: 0, deleted: 0 });
});

test("should deny cleanup to public callers and invalid scheduler tokens before deleting files", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const cleanup = createCleanupClient(database);
  assert.equal((await handleReceiptCleanup(new Request("https://example.com"), cleanup.client)).status, 405);
  assert.equal((await handleReceiptCleanup(request(null), cleanup.client)).status, 401);
  assert.equal((await handleReceiptCleanup(request("wrong-token"), cleanup.client)).status, 401);
  assert.equal(cleanup.state.removeCalls.length, 0);
  await assert.rejects(queryAsCustomer(database, "select public.claim_payment_receipt_cleanup($1)", [CLEANUP_TOKEN]), { code: "42501" });
  await assert.rejects(queryAsCustomer(database, "select * from public.retired_payment_receipts"), { code: "42501" });
  await assert.rejects(queryAsCleanupService(database, "select public.complete_payment_receipt_cleanup($1,$2)", ["wrong-token", [path]]), { code: "28000" });
});

test("should stop when claim results are invalid or Storage deletion was not confirmed", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const cleanup = createCleanupClient(database);
  cleanup.client.rpc = async () => ({ data: ["../another-bucket/file"], error: null });
  assert.equal((await handleReceiptCleanup(request(), cleanup.client)).status, 502);
  assert.equal(cleanup.state.removeCalls.length, 0);
  cleanup.client.rpc = async (name) => ({ data: name === "claim_payment_receipt_cleanup" ? [path] : 0, error: null });
  assert.equal((await handleReceiptCleanup(request(), cleanup.client)).status, 502);
});
