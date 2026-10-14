import assert from "node:assert/strict";
import { test } from "node:test";
import { getPaymentInstructions } from "../src/lib/payment.ts";

test("should request a 200000 VND deposit via bank transfer without marking it paid", () => {
  const payment = getPaymentInstructions(true);
  const qr = new URL(payment.qrUrl);
  assert.equal(payment.paymentMethod, "bank_transfer");
  assert.equal(qr.searchParams.get("amount"), "200000");
  assert.equal(qr.searchParams.has("addInfo"), false);
  assert.equal(payment.transferContent, "");
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
  assert.equal(payment.transferContent, "");
  assert.equal(new URL(payment.qrUrl).searchParams.has("addInfo"), false);
});

test("should use WEB and the order code as matching deposit transfer content and QR", () => {
  const payment = getPaymentInstructions(true, "123456-ABCDEF");
  const qr = new URL(payment.qrUrl);
  assert.equal(qr.searchParams.get("amount"), "200000");
  assert.equal(payment.transferContent, "WEB 123456-ABCDEF");
  assert.equal(qr.searchParams.get("addInfo"), payment.transferContent);
});

test("should use WEB transfer content for full payment without imposing the deposit amount", () => {
  const payment = getPaymentInstructions(false, "123456-ABCDEF");
  const qr = new URL(payment.qrUrl);
  assert.equal(payment.transferContent, "WEB 123456-ABCDEF");
  assert.equal(qr.searchParams.get("addInfo"), payment.transferContent);
  assert.equal(qr.searchParams.has("amount"), false);
});
