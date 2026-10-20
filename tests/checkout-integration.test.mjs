import assert from "node:assert/strict";
import { test } from "node:test";
import { assertCheckoutAvailable, getCheckoutProducts } from "../src/lib/checkout-products.ts";
import { snapshotOrderItems } from "../src/lib/order-pricing.ts";
import { uploadPaymentReceipt } from "../src/lib/payment-receipt.ts";
import { handleOrderNotification } from "../supabase/functions/resend-email/handler.ts";
import { EMAIL_TEMPLATE } from "../supabase/functions/resend-email/email-template.ts";
import { createCheckoutClient, createCheckoutDatabase, queryAsCustomer } from "./helpers/checkout.mjs";

const ORDER_ID = "abcdef00-0000-4000-8000-000000000001";
const receipt = new File(["first transfer image"], "transfer.png", { type: "image/png" });
const replacement = new File(["replacement transfer image"], "transfer.png", { type: "image/png" });
const cart = [{ slug: "ginger-shot", quantity: 2 }];
const config = {
  webhookSecret: "integration-secret", apiKey: "integration-key", from: "shop@example.com",
  recipients: "admin@example.com", emailTemplate: EMAIL_TEMPLATE,
};

async function checkoutData(client) {
  const products = await getCheckoutProducts(client);
  assert.deepEqual(products.map((product) => product.slug), ["ginger-shot"]);
  await assertCheckoutAvailable(client, cart);
  return {
    phone: "0900123456", customer_name: "Khách tích hợp", address: "Địa chỉ thử", district: "Quận 3",
    items: snapshotOrderItems(cart, products), bottle_type: "glass", payment_method: "bank_transfer",
    delivery_date: "2026-10-25", delivery_time: "Sáng (8h - 12h)", delivery_note: "Gọi trước khi giao",
  };
}

async function queuedNotifications(database) {
  return (await database.query("select payload from net.http_request_queue order by id")).rows.map((row) => row.payload);
}

async function deliverNotification(event) {
  return handleOrderNotification(new Request("https://example.com/resend-email", {
    method: "POST", headers: { "x-order-webhook-secret": config.webhookSecret }, body: JSON.stringify(event),
  }), config);
}

test("should create an anonymous checkout only after upload and send its committed order to the email handler", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client } = createCheckoutClient(database);
  const data = await checkoutData(client);
  assert.equal((await database.query("select * from public.orders")).rows.length, 0);
  assert.deepEqual(await queuedNotifications(database), []);
  await uploadPaymentReceipt(client, ORDER_ID, data, receipt);
  const [order] = (await database.query("select * from public.orders")).rows;
  assert.equal(order.paid, false);
  assert.equal(order.status, "processing");
  assert.ok(order.payment_receipt_submitted_at);
  assert.deepEqual(order.items, data.items);
  assert.match(order.payment_receipt_path, new RegExp(`^${ORDER_ID}/receipt-[a-f0-9]{64}$`));
  await assert.rejects(queryAsCustomer(database, "select * from public.orders where id=$1", [ORDER_ID]), { code: "42501" });
  assert.equal((await queryAsCustomer(database, "select * from storage.objects")).rows.length, 0);
  const events = await queuedNotifications(database);
  assert.equal(events.length, 1);
  assert.deepEqual(events[0].record.items, data.items);
  let email;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(options.headers["Idempotency-Key"], `order-receipt-notification/${ORDER_ID}`);
    email = JSON.parse(options.body);
    return Response.json({ id: "integration-email" });
  });
  assert.equal((await deliverNotification(events[0])).status, 200);
  assert.deepEqual(email.to, ["admin@example.com"]);
  assert.match(email.subject, /123456-ABCDEF/);
  assert.ok(email.text.includes(data.customer_name));
  assert.ok(email.text.includes(data.delivery_time));
  assert.ok(email.html.includes("https://gungdetox.com/don-hang/123456-ABCDEF"));
});

test("should use the newly selected receipt after the first image was saved but order creation failed", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client, state } = createCheckoutClient(database);
  const data = await checkoutData(client);
  state.createFailure = true;
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, receipt), /Ảnh đã lưu/);
  assert.equal(state.files.size, 1);
  assert.deepEqual(await queuedNotifications(database), []);
  state.createFailure = false;
  state.uploadFailure = true;
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, replacement), /Chưa gửi được ảnh/);
  assert.deepEqual(await queuedNotifications(database), []);
  assert.equal((await database.query("select * from public.orders")).rows.length, 0);
  state.uploadFailure = false;
  await uploadPaymentReceipt(client, ORDER_ID, data, replacement);
  const [order] = (await database.query("select * from public.orders")).rows;
  assert.equal(state.files.size, 2);
  assert.equal(state.files.get(order.payment_receipt_path), await replacement.text());
  assert.equal((await queuedNotifications(database)).length, 1);
});

test("should retry the same receipt after a lost upload or order response without duplicate orders or notifications", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client, state } = createCheckoutClient(database);
  const data = await checkoutData(client);
  state.loseUploadResponse = true;
  state.loseOrderResponse = true;
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, receipt), /Ảnh đã lưu/);
  state.loseOrderResponse = false;
  await uploadPaymentReceipt(client, ORDER_ID, data, receipt);
  assert.equal(state.files.size, 1);
  assert.equal((await database.query("select * from public.orders")).rows.length, 1);
  assert.equal((await queuedNotifications(database)).length, 1);
  const acknowledgment = await client.rpc("create_order_with_receipt", {
    order_id: ORDER_ID, order_data: { ...data, payment_receipt_path: [...state.files.keys()][0] },
  }).single();
  assert.equal(acknowledgment.data.id, ORDER_ID);
  assert.deepEqual(Object.entries(acknowledgment.data).filter(([, value]) => value !== null).map(([key]) => key).sort(),
    ["id", "payment_receipt_path"]);
});

test("should refuse to replace the receipt after the order committed even if its response was lost", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client, state } = createCheckoutClient(database);
  const data = await checkoutData(client);
  state.loseOrderResponse = true;
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, receipt), /Ảnh đã lưu/);
  state.loseOrderResponse = false;
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, replacement), /đã được ghi nhận với ảnh khác/);
  const [order] = (await database.query("select * from public.orders")).rows;
  assert.equal(state.files.get(order.payment_receipt_path), await receipt.text());
  assert.equal((await queuedNotifications(database)).length, 1);
});

test("should accept legacy receipt paths without granting anonymous order detail access", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client } = createCheckoutClient(database);
  const data = await checkoutData(client);
  await queryAsCustomer(database, "insert into storage.objects(bucket_id,name) values ('payment-receipts',$1)", [`${ORDER_ID}/receipt`]);
  const result = await client.rpc("create_order_with_receipt", { order_id: ORDER_ID, order_data: data }).single();
  assert.equal(result.error, null);
  assert.equal(result.data.id, ORDER_ID);
  assert.equal(result.data.customer_name, null);
  assert.equal(result.data.payment_receipt_path, `${ORDER_ID}/receipt`);
  assert.equal((await queuedNotifications(database)).length, 1);
  await database.transaction(async (transaction) => {
    await transaction.exec("set local role authenticated");
    assert.equal((await transaction.query("select * from public.orders")).rows.length, 0);
  });
  const admin = (await database.query("select user_id from public.admin_users limit 1")).rows[0];
  await database.transaction(async (transaction) => {
    await transaction.query("select set_config('request.jwt.claim.sub',$1,true)", [admin.user_id]);
    await transaction.exec("set local role authenticated");
    assert.equal((await transaction.query("select customer_name from public.orders")).rows[0].customer_name, data.customer_name);
  });
});

test("should stop sold-out or removed products before payment and enforce availability again during creation", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client } = createCheckoutClient(database);
  const data = await checkoutData(client);
  await database.exec("update public.products set in_stock=false where slug='ginger-shot'");
  await assert.rejects(assertCheckoutAvailable(client, cart), /không còn bán/);
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, receipt), /Ảnh đã lưu/);
  await database.exec("delete from public.products where slug='ginger-shot'");
  await assert.rejects(assertCheckoutAvailable(client, cart), /không còn bán/);
  assert.equal((await database.query("select * from public.orders")).rows.length, 0);
  assert.deepEqual(await queuedNotifications(database), []);
});

test("should not create an order or email when upload fails, and preserve the order when email delivery fails", async (t) => {
  const database = await createCheckoutDatabase();
  t.after(() => database.close());
  const { client, state } = createCheckoutClient(database);
  const data = await checkoutData(client);
  state.uploadFailure = true;
  await assert.rejects(uploadPaymentReceipt(client, ORDER_ID, data, receipt), /Chưa gửi được ảnh/);
  assert.equal((await database.query("select * from public.orders")).rows.length, 0);
  assert.deepEqual(await queuedNotifications(database), []);
  state.uploadFailure = false;
  await uploadPaymentReceipt(client, ORDER_ID, data, replacement);
  const [event] = await queuedNotifications(database);
  t.mock.method(globalThis, "fetch", async () => Response.json({ message: "Unavailable" }, { status: 503 }));
  assert.equal((await deliverNotification(event)).status, 502);
  assert.equal((await database.query("select * from public.orders")).rows.length, 1);
  t.mock.method(globalThis, "fetch", async () => Response.json({ id: "retry-email" }));
  assert.equal((await deliverNotification(event)).status, 200);
  assert.equal((await queuedNotifications(database)).length, 1);
});
