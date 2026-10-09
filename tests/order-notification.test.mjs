import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { handleOrderNotification } from "../supabase/functions/resend-email/handler.ts";

const payload = JSON.parse(readFileSync(new URL("../supabase/functions/resend-email/test-payload.json", import.meta.url), "utf8"));
const emailTemplate = readFileSync(new URL("../supabase/functions/resend-email/email-template.html", import.meta.url), "utf8");
const config = {
  webhookSecret: "test-webhook-secret",
  apiKey: "test-resend-key",
  from: "GỪNG DETOX <onboarding@resend.dev>",
  recipients: "nghiabh.it@gmail.com",
  emailTemplate,
};

function request(body = payload, secret = config.webhookSecret) {
  return new Request("https://example.supabase.co/functions/v1/resend-email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-order-webhook-secret": secret },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("should send a new-order notification only to the configured internal recipient", async () => {
  const calls = [];
  const response = await handleOrderNotification(request({ ...payload, to: "customer@example.com" }), config, async (url, init) => {
    calls.push({ url, ...init });
    return Response.json({ id: "email-test-id" });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { emailId: "email-test-id" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(calls[0].headers["Idempotency-Key"], `order-notification/${payload.record.id}`);
  const email = JSON.parse(calls[0].body);
  assert.deepEqual(email.to, ["nghiabh.it@gmail.com"]);
  assert.match(email.subject, /000000-000000/);
  assert.match(email.text, /ginger-shot × 2/);
  assert.match(email.text, /https:\/\/gungdetox.com\/admin\/don-hang/);
  for (const expected of [payload.record.customer_name, payload.record.phone, payload.record.address,
    payload.record.district, "09/10/2026 (Chiều (13h - 17h))", "ginger-shot", "Tiệm GỪNG có đơn mới!"]) {
    assert.ok(email.html.includes(expected), `HTML should contain ${expected}`);
  }
  assert.match(email.html, /<td[^>]*>2<\/td>/);
  assert.ok(!email.html.includes("{{"));
});

test("should reject unauthorized and unconfigured requests without contacting Resend", async () => {
  const fetcher = () => assert.fail("Resend must not be contacted");
  assert.equal((await handleOrderNotification(request(payload, "wrong"), config, fetcher)).status, 401);
  assert.equal((await handleOrderNotification(request(), { ...config, webhookSecret: "" }, fetcher)).status, 503);
  assert.equal((await handleOrderNotification(request(), { ...config, apiKey: "" }, fetcher)).status, 503);
  assert.equal((await handleOrderNotification(new Request("https://example.com"), config, fetcher)).status, 405);
});

test("should reject malformed payloads and events other than new public orders", async () => {
  const fetcher = () => assert.fail("Resend must not be contacted");
  for (const invalid of [
    "not-json", null, { ...payload, type: "UPDATE" }, { ...payload, table: "products" },
    { ...payload, schema: "private" },
    { ...payload, record: { ...payload.record, id: "bad-id" } },
    { ...payload, record: { ...payload.record, items: [] } },
    { ...payload, record: { ...payload.record, shipping_fee_note: {} } },
    { ...payload, record: { ...payload.record, items: [{ productSlug: "ginger-shot", quantity: 0 }] } },
  ]) {
    assert.equal((await handleOrderNotification(request(invalid), config, fetcher)).status, 400);
  }
});

test("should escape customer and product HTML without interpreting template-like customer text", async () => {
  let email;
  const record = { ...payload.record, customer_name: '<img src=x onerror="bad()"> & {{product_rows}}',
    address: "<b>Địa chỉ</b>", items: [{ productSlug: "<script>alert('bad')</script>", quantity: 3 }] };
  await handleOrderNotification(request({ ...payload, record }), config, async (_, init) => {
    email = JSON.parse(init.body);
    return Response.json({ id: "email-test-id" });
  });
  assert.ok(email.html.includes("&lt;img src=x onerror=&quot;bad()&quot;&gt; &amp; {{product_rows}}"));
  assert.ok(email.html.includes("&lt;b&gt;Địa chỉ&lt;/b&gt;"));
  assert.ok(email.html.includes("&lt;script&gt;alert(&#39;bad&#39;)&lt;/script&gt;"));
  assert.ok(!email.html.includes("<img src=x"));
  assert.ok(!email.html.includes("<script"));
});

test("should display missing delivery time explicitly for old orders", async () => {
  let email;
  const record = { ...payload.record, shipping_fee_note: "Phí ship tính theo khoảng cách" };
  await handleOrderNotification(request({ ...payload, record }), config, async (_, init) => {
    email = JSON.parse(init.body);
    return Response.json({ id: "email-test-id" });
  });
  assert.match(email.html, /Chưa có thông tin/);
  assert.match(email.text, /Thời điểm nhận hàng: Chưa có thông tin/);
});

test("should deploy the current HTML file including its embedded CSS", () => {
  const entry = readFileSync(new URL("../supabase/functions/resend-email/index.ts", import.meta.url), "utf8");
  assert.ok(entry.includes(`const EMAIL_TEMPLATE = ${JSON.stringify(emailTemplate)};`), "Run node scripts/build-order-email-function.mjs after editing the template");
  assert.ok(emailTemplate.includes("<style>"));
});

test("should report invalid recipients and provider failures instead of claiming delivery", async () => {
  assert.equal((await handleOrderNotification(request(), { ...config, recipients: "bad-email" }, () => assert.fail("Invalid recipient must not be sent"))).status, 502);
  for (const fetcher of [
    async () => Response.json({ message: "Recipient is not allowed" }, { status: 403 }),
    async () => Response.json({}),
    async () => new Response("not-json"),
    async () => { throw new Error("Network unavailable"); },
  ]) {
    assert.equal((await handleOrderNotification(request(), config, fetcher)).status, 502);
  }
});

test("should accept a separate recipient list and reuse the order idempotency key on retry", async () => {
  const calls = [];
  const fetcher = async (_, init) => {
    calls.push(init);
    return Response.json({ id: "email-test-id" });
  };
  const settings = { ...config, recipients: "nghiabh.it@gmail.com, owner@example.com" };
  await handleOrderNotification(request(), settings, fetcher);
  await handleOrderNotification(request(), settings, fetcher);
  assert.deepEqual(JSON.parse(calls[0].body).to, ["nghiabh.it@gmail.com", "owner@example.com"]);
  assert.equal(calls[0].headers["Idempotency-Key"], calls[1].headers["Idempotency-Key"]);
});
