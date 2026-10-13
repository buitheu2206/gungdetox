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
        items: [{ productSlug: "ginger-shot", quantity: 2, unitPrice: 40000 }], address: "Địa chỉ thử nghiệm", district: "Quận 3",
      } }),
    }), { webhookSecret: "test-secret", apiKey: "test-key", from: "test@example.com", recipients: "admin@example.com", emailTemplate: EMAIL_TEMPLATE });
    assert.equal(response.status, 200);
    assert.match(sentEmail.html, /href="https:\/\/gungdetox\.com\/don-hang\/123456-ABCDEF"/);
    assert.ok(sentEmail.text.includes("https://gungdetox.com/don-hang/123456-ABCDEF"));
    assert.ok(!sentEmail.html.includes("https://gungdetox.com/admin/don-hang"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
