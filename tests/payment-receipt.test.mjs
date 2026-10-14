import assert from "node:assert/strict";
import { test } from "node:test";
import { getReceiptPath, getPaymentReceiptUrl, uploadPaymentReceipt, validateReceipt, MAX_RECEIPT_SIZE } from "../src/lib/payment-receipt.ts";

const orderId = "00000000-0000-4000-8000-000000000001";
const token = "00000000-0000-4000-8000-000000000002";
const file = new File(["receipt"], "transfer.png", { type: "image/png" });

function receiptClient({ uploadError = null, uploaded = false, statusError = null, confirmationError = null, files = [], listError = null, signedError = null } = {}) {
  const calls = [];
  const bucket = {
    async upload(...args) { calls.push(["upload", ...args]); return { error: uploadError }; },
    async list(...args) { calls.push(["list", ...args]); return { data: files, error: listError }; },
    async createSignedUrl(...args) { calls.push(["sign", ...args]); return { data: { signedUrl: "https://example.com/private-receipt" }, error: signedError }; },
  };
  return {
    calls,
    storage: { from(name) { assert.equal(name, "payment-receipts"); return bucket; } },
    async rpc(name, args) {
      calls.push([name, args]);
      return name === "confirm_payment_receipt"
        ? { data: confirmationError ? null : "2026-10-13T09:00:00Z", error: confirmationError }
        : { data: uploaded, error: statusError };
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

test("should bind the receipt path to the created order and secret upload capability", () => {
  assert.equal(getReceiptPath(orderId, token), `${orderId}/${token}`);
  assert.throws(() => getReceiptPath("123456-ABCDEF", token));
  assert.throws(() => getReceiptPath(orderId, "../other-order"));
});

test("should upload privately without overwriting a receipt or marking the order paid", async () => {
  const client = receiptClient();
  await uploadPaymentReceipt(client, orderId, token, file);
  assert.deepEqual(client.calls, [
    ["upload", `${orderId}/${token}`, file, { contentType: "image/png", upsert: false }],
    ["confirm_payment_receipt", { order_id: orderId, upload_token: token }],
  ]);
});

test("should reject invalid files before contacting storage", async () => {
  const client = receiptClient();
  await assert.rejects(uploadPaymentReceipt(client, orderId, token, new File(["svg"], "receipt.svg", { type: "image/svg+xml" })));
  assert.equal(client.calls.length, 0);
});

test("should recognize an upload that succeeded before the response was lost", async () => {
  const client = receiptClient({ uploadError: new Error("timeout"), uploaded: true });
  await uploadPaymentReceipt(client, orderId, token, file);
  assert.deepEqual(client.calls[1], ["has_payment_receipt", { order_id: orderId, upload_token: token }]);
  assert.equal(client.calls[2][0], "confirm_payment_receipt");
});

test("should preserve upload failures so the customer can retry", async () => {
  const client = receiptClient({ uploadError: new Error("bucket unavailable") });
  await assert.rejects(uploadPaymentReceipt(client, orderId, token, file), /Đơn đã được tạo/);
  assert.equal(client.calls.some(([name]) => name === "confirm_payment_receipt"), false);
});

test("should allow confirmation retry after an image was saved without a confirmation", async () => {
  await assert.rejects(uploadPaymentReceipt(receiptClient({ confirmationError: new Error("request failed") }), orderId, token, file), /Ảnh đã lưu/);
  const retry = receiptClient({ uploadError: new Error("already exists"), uploaded: true });
  await uploadPaymentReceipt(retry, orderId, token, file);
  assert.equal(retry.calls.at(-1)[0], "confirm_payment_receipt");
});

test("should report a failed status check instead of assuming the receipt was uploaded", async () => {
  const statusError = new Error("status unavailable");
  const client = receiptClient({ uploadError: new Error("timeout"), statusError, uploaded: true });
  await assert.rejects(uploadPaymentReceipt(client, orderId, token, file), (error) => error.cause === statusError);
});

test("should distinguish orders without receipts from inaccessible storage", async () => {
  assert.equal(await getPaymentReceiptUrl(receiptClient(), orderId), null);
  await assert.rejects(getPaymentReceiptUrl(receiptClient({ listError: new Error("access denied") }), orderId), /Không tải được ảnh/);
});

test("should create an expiring URL for the receipt belonging to the requested order", async () => {
  const client = receiptClient({ files: [{ name: token }] });
  assert.equal(await getPaymentReceiptUrl(client, orderId), "https://example.com/private-receipt");
  assert.deepEqual(client.calls[1], ["sign", `${orderId}/${token}`, 3600]);
});

test("should report errors when a private receipt cannot be signed", async () => {
  await assert.rejects(getPaymentReceiptUrl(receiptClient({ files: [{ name: token }], signedError: new Error("access denied") }), orderId), /Không tải được ảnh/);
});
