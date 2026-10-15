import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { EMAIL_TEMPLATE } from "../supabase/functions/resend-email/email-template.ts";
import { handleOrderNotification } from "../supabase/functions/resend-email/handler.ts";

test("should load the current HTML and CSS from a separate template module", () => {
  const emailTemplate = readFileSync(new URL("../supabase/functions/resend-email/email-template.html", import.meta.url), "utf8");
  const entry = readFileSync(new URL("../supabase/functions/resend-email/index.ts", import.meta.url), "utf8");
  assert.equal(EMAIL_TEMPLATE, emailTemplate, "Run node scripts/build-order-email-function.mjs after editing the template");
  assert.ok(!entry.includes("<!doctype html>"), "The entry point must not embed the email HTML");
  assert.ok(emailTemplate.includes("<style>"));
});

test("should link both HTML and text notifications to the specific order detail page", async () => {
  const originalFetch = globalThis.fetch;
  let sentEmail;
  globalThis.fetch = async (_url, options) => {
    sentEmail = JSON.parse(options.body);
    return Response.json({ id: "test-email-id" });
  };
  try {
    const response = await handleOrderNotification(new Request("https://example.com/resend-email", {
      method: "POST", headers: { "x-order-webhook-secret": "test-secret" },
      body: JSON.stringify({ type: "INSERT", schema: "public", table: "orders", record: {
        id: "abcdef12-1234-1234-1234-123456789012", phone: "0900123456", customer_name: "Khách thử nghiệm",
        payment_receipt_submitted_at: "2026-10-13T09:00:00Z",
        items: [{ productSlug: "ginger-shot", quantity: 2, unitPrice: 40000 }], address: "Địa chỉ thử nghiệm", district: "Quận 3",
      } }),
    }), { webhookSecret: "test-secret", apiKey: "test-key", from: "test@example.com", recipients: "admin@example.com", emailTemplate: EMAIL_TEMPLATE });
    assert.equal(response.status, 200);
    assert.match(sentEmail.html, /href="https:\/\/gungdetox\.com\/don-hang\/123456-ABCDEF"/);
    assert.ok(sentEmail.text.includes("https://gungdetox.com/don-hang/123456-ABCDEF"));
    assert.ok(!sentEmail.html.includes("https://gungdetox.com/admin/don-hang"));
    assert.equal(sentEmail.subject, "[GỪNG DETOX] Đơn hàng mới 123456-ABCDEF");
    assert.match(sentEmail.html, /<h1[^>]*>Có đơn hàng mới<\/h1>/);
    assert.match(sentEmail.text, /^Có đơn hàng mới: 123456-ABCDEF/);
    assert.doesNotMatch(sentEmail.html + sentEmail.text, /Khách đã gửi ảnh|đối chiếu tiền vào ngân hàng|trước khi xác nhận đã thanh toán/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

const config = { webhookSecret: "test-secret", apiKey: "test-key", from: "test@example.com", recipients: "admin@example.com", emailTemplate: EMAIL_TEMPLATE };
const submittedOrder = {
  id: "abcdef12-1234-1234-1234-123456789012", phone: "0900123456", customer_name: "Khách thử nghiệm",
  items: [{ productSlug: "ginger-shot", quantity: 2 }], payment_receipt_submitted_at: "2026-10-13T09:00:00Z",
};

function notificationRequest(event, secret = config.webhookSecret) {
  return new Request("https://example.com/resend-email", {
    method: "POST", headers: { "x-order-webhook-secret": secret }, body: JSON.stringify(event),
  });
}

test("should not send email for an order without a receipt timestamp, or for a status update", async () => {
  const originalFetch = globalThis.fetch;
  let sends = 0;
  globalThis.fetch = async () => { sends++; return Response.json({ id: "unexpected" }); };
  try {
    for (const event of [
      { type: "INSERT", record: { ...submittedOrder, payment_receipt_submitted_at: null } },
      { type: "UPDATE", record: { ...submittedOrder, status: "delivering" }, old_record: submittedOrder },
    ]) {
      const response = await handleOrderNotification(notificationRequest({ ...event, schema: "public", table: "orders" }), config);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { ignored: true });
    }
    assert.equal(sends, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test("should reject an unauthorized or malformed confirmation before contacting Resend", async () => {
  const originalFetch = globalThis.fetch;
  let sends = 0;
  globalThis.fetch = async () => { sends++; return Response.json({ id: "unexpected" }); };
  try {
    const event = { type: "INSERT", schema: "public", table: "orders", record: submittedOrder };
    assert.equal((await handleOrderNotification(notificationRequest(event, "wrong-secret"), config)).status, 401);
    const invalid = { ...event, record: { ...submittedOrder, payment_receipt_submitted_at: "invalid date" } };
    assert.equal((await handleOrderNotification(notificationRequest(invalid), config)).status, 400);
    assert.equal(sends, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test("should use the receipt event as its idempotency key and report delivery service failures", async () => {
  const originalFetch = globalThis.fetch;
  let key;
  globalThis.fetch = async (_url, options) => {
    key = options.headers["Idempotency-Key"];
    return Response.json({ message: "Temporarily unavailable" }, { status: 503 });
  };
  try {
    const event = { type: "INSERT", schema: "public", table: "orders", record: submittedOrder };
    const response = await handleOrderNotification(notificationRequest(event), config);
    assert.equal(response.status, 502);
    assert.equal(key, `order-receipt-notification/${submittedOrder.id}`);
  } finally { globalThis.fetch = originalFetch; }
});
