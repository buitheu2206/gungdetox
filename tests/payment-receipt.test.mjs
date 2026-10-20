import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { ExistingOrderDetailsError, getReceiptPath, getPaymentReceiptUrl, uploadPaymentReceipt, validateReceipt, MAX_RECEIPT_SIZE } from "../src/lib/payment-receipt.ts";

const orderId = "00000000-0000-4000-8000-000000000001";
const orderData = { phone: "0900000000", customer_name: "Khách thử nghiệm" };
const file = new File(["receipt"], "transfer.png", { type: "image/png" });
const receiptPath = getReceiptPath(orderId, createHash("sha256").update("receipt").digest("hex"));

function receiptClient({ uploadError = null, uploaded = false, createError = null, created = { id: orderId }, receipt = null, orderError = null, signedError = null } = {}) {
  const calls = [];
  const bucket = {
    async upload(...args) { calls.push(["upload", ...args]); return { error: uploadError }; },
    async createSignedUrl(...args) { calls.push(["sign", ...args]); return { data: { signedUrl: "https://example.com/private-receipt" }, error: signedError }; },
  };
  return {
    calls,
    from(table) {
      assert.equal(table, "orders");
      const query = {
        select() { return query; },
        eq(column, id) { assert.equal(column, "id"); assert.equal(id, orderId); return query; },
        async single() { return { data: receipt, error: orderError }; },
      };
      return query;
    },
    storage: { from(name) { assert.equal(name, "payment-receipts"); return bucket; } },
    rpc(name, args) {
      calls.push([name, args]);
      if (name === "is_payment_receipt_retired") return Promise.resolve({ data: false, error: null });
      if (name === "has_payment_receipt") return Promise.resolve({ data: uploaded, error: null });
      return { single: () => Promise.resolve(createError ? { data: null, error: createError } : { data: created, error: null }) };
    },
  };
}

test("should accept supported receipt images up to 5 MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.doesNotThrow(() => validateReceipt({ type, size: MAX_RECEIPT_SIZE }));
  }
});

test("should reject empty, oversized and unsupported receipt files", () => {
  for (const invalid of [
    { type: "image/png", size: 0 }, { type: "image/png", size: MAX_RECEIPT_SIZE + 1 },
    { type: "image/svg+xml", size: 1 }, { type: "text/plain", size: 1 },
  ]) assert.throws(() => validateReceipt(invalid));
});

test("should bind receipt versions to their content hash under the same order id", () => {
  assert.equal(getReceiptPath(orderId), `${orderId}/receipt`);
  assert.equal(getReceiptPath(orderId, "a".repeat(64)), `${orderId}/receipt-${"a".repeat(64)}`);
  assert.throws(() => getReceiptPath(orderId, "../other-order"));
  assert.throws(() => getReceiptPath("123456-ABCDEF"));
});

test("should upload the receipt then create the order from it", async () => {
  const client = receiptClient();
  await uploadPaymentReceipt(client, orderId, orderData, file);
  assert.deepEqual(client.calls[0], ["is_payment_receipt_retired", { receipt_path: receiptPath }]);
  assert.deepEqual(client.calls[1], ["upload", receiptPath, file, { contentType: "image/png", upsert: false }]);
  assert.equal(client.calls[2][0], "create_order_with_receipt");
  assert.deepEqual(client.calls[2][1], { order_data: { ...orderData, payment_receipt_path: receiptPath }, order_id: orderId });
});

test("should reject invalid files before contacting storage", async () => {
  const client = receiptClient();
  await assert.rejects(uploadPaymentReceipt(client, orderId, orderData, new File(["svg"], "receipt.svg", { type: "image/svg+xml" })));
  assert.equal(client.calls.length, 0);
});

test("should reject invalid order data and IDs before uploading a receipt", async () => {
  const client = receiptClient();
  for (const data of [null, [], "invalid"]) await assert.rejects(uploadPaymentReceipt(client, orderId, data, file), /Thông tin đơn hàng/);
  await assert.rejects(uploadPaymentReceipt(client, "invalid", orderData, file), /Thông tin gửi ảnh/);
  assert.equal(client.calls.length, 0);
});

test("should recognize an upload that succeeded before the response was lost, then create the order", async () => {
  const client = receiptClient({ uploadError: new Error("timeout"), uploaded: true });
  await uploadPaymentReceipt(client, orderId, orderData, file);
  assert.deepEqual(client.calls[2], ["has_payment_receipt", { order_id: orderId, receipt_path: receiptPath }]);
  assert.equal(client.calls[3][0], "create_order_with_receipt");
});

test("should preserve upload failures so the customer can retry", async () => {
  const client = receiptClient({ uploadError: new Error("bucket unavailable") });
  await assert.rejects(uploadPaymentReceipt(client, orderId, orderData, file), /Chưa gửi được ảnh/);
  assert.equal(client.calls.some(([name]) => name === "create_order_with_receipt"), false);
});

test("should report a failed status check instead of assuming the receipt was uploaded", async () => {
  const client = receiptClient({ uploadError: new Error("timeout"), uploaded: false });
  await assert.rejects(uploadPaymentReceipt(client, orderId, orderData, file));
  assert.equal(client.calls.some(([name]) => name === "create_order_with_receipt"), false);
});

test("should stop order creation when receipt status is unavailable", async () => {
  const client = receiptClient({ uploadError: new Error("timeout") });
  client.rpc = async (name) => name === "is_payment_receipt_retired"
    ? { data: false, error: null } : { data: null, error: new Error("status unavailable") };
  await assert.rejects(uploadPaymentReceipt(client, orderId, orderData, file), /Chưa kiểm tra được ảnh/);
  assert.equal(client.calls.some(([name]) => name === "create_order_with_receipt"), false);
});

test("should surface order creation failures distinctly from upload failures", async () => {
  const client = receiptClient({ createError: new Error("db unavailable") });
  await assert.rejects(uploadPaymentReceipt(client, orderId, orderData, file), /Ảnh đã lưu/);
});

test("should identify changed-data retries so the UI never reports those edits as saved", async () => {
  const client = receiptClient({ createError: { details: "ORDER_ALREADY_CREATED_WITH_DIFFERENT_DETAILS" } });
  await assert.rejects(uploadPaymentReceipt(client, orderId, orderData, file), (error) =>
    error instanceof ExistingOrderDetailsError && error.message.includes("Thông tin vừa sửa chưa được lưu"));
});

test("should distinguish orders without receipts from inaccessible storage", async () => {
  assert.equal(await getPaymentReceiptUrl(receiptClient(), orderId), null);
  await assert.rejects(getPaymentReceiptUrl(receiptClient({ orderError: new Error("access denied") }), orderId), /Không tải được ảnh/);
});

test("should create an expiring URL for the receipt belonging to the requested order", async () => {
  const client = receiptClient({ receipt: { payment_receipt_path: receiptPath, payment_receipt_submitted_at: "2026-10-20T09:00:00Z" } });
  assert.equal(await getPaymentReceiptUrl(client, orderId), "https://example.com/private-receipt");
  assert.deepEqual(client.calls[0], ["sign", receiptPath, 3600]);
});

test("should report errors when a private receipt cannot be signed", async () => {
  await assert.rejects(getPaymentReceiptUrl(receiptClient({ receipt: { payment_receipt_submitted_at: "2026-10-20T09:00:00Z" }, signedError: new Error("access denied") }), orderId), /Không tải được ảnh/);
});

test("should preserve legacy receipt paths and reject a path from another order", async () => {
  const client = receiptClient({ receipt: { payment_receipt_submitted_at: "2026-10-20T09:00:00Z" } });
  await getPaymentReceiptUrl(client, orderId);
  assert.deepEqual(client.calls[0], ["sign", `${orderId}/receipt`, 3600]);
  const invalid = receiptClient({ receipt: { payment_receipt_submitted_at: "2026-10-20T09:00:00Z", payment_receipt_path: "other/receipt" } });
  await assert.rejects(getPaymentReceiptUrl(invalid, orderId), /Không tải được ảnh/);
  assert.equal(invalid.calls.length, 0);
});
