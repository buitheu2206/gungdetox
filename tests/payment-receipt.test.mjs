import assert from "node:assert/strict";
import { test } from "node:test";
import { getReceiptPath, getPaymentReceiptUrl, uploadPaymentReceipt, validateReceipt, MAX_RECEIPT_SIZE } from "../src/lib/payment-receipt.ts";

const orderId = "00000000-0000-4000-8000-000000000001";
const orderData = { phone: "0900000000", customer_name: "Khách thử nghiệm" };
const file = new File(["receipt"], "transfer.png", { type: "image/png" });

function receiptClient({ uploadError = null, uploaded = false, createError = null, created = { id: orderId }, files = [], listError = null, signedError = null } = {}) {
  const calls = [];
  const bucket = {
    async upload(...args) { calls.push(["upload", ...args]); return { error: uploadError }; },
    async list(...args) { calls.push(["list", ...args]); return { data: files, error: listError }; },
    async createSignedUrl(...args) { calls.push(["sign", ...args]); return { data: { signedUrl: "https://example.com/private-receipt" }, error: signedError }; },
  };
  return {
    calls,
    storage: { from(name) { assert.equal(name, "payment-receipts"); return bucket; } },
    rpc(name, args) {
      calls.push([name, args]);
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

test("should bind the receipt path to a fixed name under the order id", () => {
  assert.equal(getReceiptPath(orderId), `${orderId}/receipt`);
  assert.throws(() => getReceiptPath("123456-ABCDEF"));
});

test("should upload the receipt then create the order from it", async () => {
  const client = receiptClient();
  await uploadPaymentReceipt(client, orderId, orderData, file);
  assert.deepEqual(client.calls[0], ["upload", `${orderId}/receipt`, file, { contentType: "image/png", upsert: false }]);
  assert.equal(client.calls[1][0], "create_order_with_receipt");
  assert.deepEqual(client.calls[1][1], { order_data: orderData, order_id: orderId });
});

test("should reject invalid files before contacting storage", async () => {
  const client = receiptClient();
  await assert.rejects(uploadPaymentReceipt(client, orderId, orderData, new File(["svg"], "receipt.svg", { type: "image/svg+xml" })));
  assert.equal(client.calls.length, 0);
});

test("should recognize an upload that succeeded before the response was lost, then create the order", async () => {
  const client = receiptClient({ uploadError: new Error("timeout"), uploaded: true });
  await uploadPaymentReceipt(client, orderId, orderData, file);
  assert.deepEqual(client.calls[1], ["has_payment_receipt", { order_id: orderId }]);
  assert.equal(client.calls[2][0], "create_order_with_receipt");
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

test("should surface order creation failures distinctly from upload failures", async () => {
  const client = receiptClient({ createError: new Error("db unavailable") });
  await assert.rejects(uploadPaymentReceipt(client, orderId, orderData, file), /Ảnh đã lưu/);
});

test("should distinguish orders without receipts from inaccessible storage", async () => {
  assert.equal(await getPaymentReceiptUrl(receiptClient(), orderId), null);
  await assert.rejects(getPaymentReceiptUrl(receiptClient({ listError: new Error("access denied") }), orderId), /Không tải được ảnh/);
});

test("should create an expiring URL for the receipt belonging to the requested order", async () => {
  const client = receiptClient({ files: [{ name: "receipt" }] });
  assert.equal(await getPaymentReceiptUrl(client, orderId), "https://example.com/private-receipt");
  assert.deepEqual(client.calls[1], ["sign", `${orderId}/receipt`, 3600]);
});

test("should report errors when a private receipt cannot be signed", async () => {
  await assert.rejects(getPaymentReceiptUrl(receiptClient({ files: [{ name: "receipt" }], signedError: new Error("access denied") }), orderId), /Không tải được ảnh/);
});
