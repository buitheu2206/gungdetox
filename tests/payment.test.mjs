import assert from "node:assert/strict";
import { test } from "node:test";
import { getPaymentInstructions } from "../src/lib/payment.ts";

test("should request a 200000 VND deposit via bank transfer without marking it paid", () => {
  const payment = getPaymentInstructions(true);
  const qr = new URL(payment.qrUrl);
  assert.equal(payment.paymentMethod, "bank_transfer");
  assert.equal(qr.searchParams.get("amount"), "200000");
  assert.equal(qr.pathname, "/image/970436-1065425789-qr_only.png");
  assert.match(payment.instructions, /200\.000đ/);
  assert.match(payment.instructions, /sau khi nhận tiền cọc/);
  assert.match(payment.orderNote, /Cọc 200\.000đ qua chuyển khoản/);
  assert.equal("paid" in payment, false);
});

test("should preserve standard transfer instructions when switching back from deposit", () => {
  const payment = getPaymentInstructions(false);
  assert.equal(new URL(payment.qrUrl).searchParams.has("amount"), false);
  assert.equal(payment.orderNote, "");
  assert.equal(payment.paymentMethod, "bank_transfer");
});

test("should include the created order code in the deposit QR for reconciliation", () => {
  const payment = getPaymentInstructions(true, "GD-123456-ABCDEF");
  const qr = new URL(payment.qrUrl);
  assert.equal(qr.searchParams.get("amount"), "200000");
  assert.equal(qr.searchParams.get("addInfo"), "GD-123456-ABCDEF");
});
