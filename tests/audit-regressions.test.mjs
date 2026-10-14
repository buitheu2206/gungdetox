import assert from "node:assert/strict";
import { test } from "node:test";
import { escapeHtml, csvCell, sanitizePostHtml, safeMediaUrl } from "../src/lib/output.ts";
import { productCardHtml, comboVariantGroupCardHtml } from "../src/lib/templates.ts";
import { loadAllRows, countOrdersByCustomer } from "../src/lib/load-rows.ts";
import { resolveOrderItems } from "../src/lib/order-pricing.ts";
import { getDeliveryDetails, getOrderDelivery } from "../src/lib/order-details.ts";
import { lookupCustomerOrder } from "../src/lib/order-lookup.ts";
import { hasAdminAccess } from "../src/lib/admin-access.ts";

test("should escape text and both quote styles at HTML attribute boundaries", () => {
  assert.equal(escapeHtml(`<b title="x">O'Reilly & Co</b>`), "&lt;b title=&quot;x&quot;&gt;O&#39;Reilly &amp; Co&lt;/b&gt;");
  const product = { slug: "test", type: "single", name: `x" onmouseover="alert(1)`, image_url: `https://example.com/x" onerror="alert(1)`, price_retail: 0 };
  const html = productCardHtml(product);
  assert.ok(html.includes('&quot; onerror=&quot;'));
  assert.ok(!html.includes('" onerror="'));
  const variants = comboVariantGroupCardHtml("Name", [{ ...product, name: "O'Reilly" }]);
  assert.ok(variants.includes("O&#39;Reilly"));
});

test("should retain supported rich text while removing scripts, handlers and unsafe URLs", () => {
  const html = sanitizePostHtml('<h2>Title</h2><p class="ql-align-center other"><strong>Bold</strong><a href="javascript:alert(1)" onclick="alert(1)">Link</a><img src=x onerror=alert(1)><script>alert(1)</script></p>');
  assert.match(html, /<h2>Title<\/h2>/);
  assert.match(html, /class="ql-align-center"/);
  assert.match(html, /<strong>Bold<\/strong>/);
  assert.doesNotMatch(html, /javascript|onclick|onerror|script|<img|other/);
  assert.equal(safeMediaUrl("javascript:alert(1)"), "");
  assert.equal(safeMediaUrl("//evil.example/image"), "");
  assert.equal(safeMediaUrl("/images/a.webp"), "/images/a.webp");
});

test("should neutralize spreadsheet formulas without corrupting ordinary CSV values", () => {
  for (const value of ["=SUM(1,2)", "+1", "-2", "@cmd", "  =1", "\t=1", "\r=1"]) {
    assert.ok(csvCell(value).startsWith('"\''));
  }
  assert.equal(csvCell('A, "B"'), '"A, ""B"""');
  assert.equal(csvCell("0901234567"), '"0901234567"');
});

test("should load all rows even when the API cap is lower than the requested page size", async () => {
  const rows = Array.from({ length: 7 }, (_, id) => ({ id }));
  const starts = [];
  assert.deepEqual(await loadAllRows(async (from) => {
    starts.push(from);
    return { data: rows.slice(from, from + 2), error: null };
  }), rows);
  assert.deepEqual(starts, [0, 2, 4, 6, 7]);
});

test("should fail rather than publish a partial dataset when a later page query fails", async () => {
  await assert.rejects(loadAllRows(async (from) => from === 0
    ? { data: [{ id: 1 }], error: null }
    : { data: null, error: { message: "offline" } }), /offline/);
});

test("should count customer orders including equal timestamps without changing input order", () => {
  const orders = [
    { id: "new", phone: "1", created_at: "2026-10-14" },
    { id: "old", phone: "1", created_at: "2026-10-13" },
    { id: "twin", phone: "1", created_at: "2026-10-14" },
    { id: "other", phone: "2", created_at: "2026-10-14" },
  ];
  const counts = countOrdersByCustomer(orders);
  assert.deepEqual(orders.map((order) => counts.get(order.id)), [3, 1, 3, 1]);
  assert.equal(orders[0].id, "new");
});

test("should isolate malformed order items instead of crashing the entire admin table", () => {
  for (const items of [null, {}, [null], [{}], [{ productSlug: "a", quantity: -1 }]]) {
    assert.deepEqual(resolveOrderItems(items, []), []);
  }
});

test("should preserve delivery notes containing the legacy delimiter and prefer structured fields", () => {
  assert.equal(getDeliveryDetails("Giao ngày 14/10/2026. Ghi chú của khách: Gọi trước. Phí ship tôi trả. Phí ship tùy khoảng cách.").note, "Gọi trước. Phí ship tôi trả");
  assert.deepEqual(getOrderDelivery({ delivery_date: "2026-10-15", delivery_time: "Sáng", delivery_note: "Gọi trước. Phí ship tôi trả", shipping_fee_note: "old" }), {
    date: "15/10/2026", time: "Sáng", schedule: "15/10/2026 (Sáng)", note: "Gọi trước. Phí ship tôi trả",
  });
});

test("should require both lookup credentials and send only the exact RPC arguments", async () => {
  const calls = [];
  const client = { rpc: async (...args) => { calls.push(args); return { data: { code: "234567-ABCDEF" }, error: null }; } };
  for (const [code, phone] of [["", "0901234567"], ["234567-ABCDEF", ""], ["%", "0901234567"]]) {
    await assert.rejects(lookupCustomerOrder(client, code, phone), /Nhập đúng/);
  }
  assert.equal(calls.length, 0);
  assert.deepEqual(await lookupCustomerOrder(client, "234567-abcdef", "0901234567"), { code: "234567-ABCDEF" });
  assert.deepEqual(calls, [["lookup_order", { order_code: "234567-ABCDEF", customer_phone: "0901234567" }]]);
});

test("should distinguish no matching order from lookup service errors", async () => {
  assert.equal(await lookupCustomerOrder({ rpc: async () => ({ data: null, error: null }) }, "234567-ABCDEF", "0901234567"), null);
  await assert.rejects(lookupCustomerOrder({ rpc: async () => ({ data: null, error: { message: "offline" } }) }, "234567-ABCDEF", "0901234567"), /Không tra cứu được/);
});

test("should grant the admin UI only when the database explicitly confirms the role", async () => {
  for (const data of [false, null, "true"]) assert.equal(await hasAdminAccess({ rpc: async () => ({ data, error: null }) }), false);
  assert.equal(await hasAdminAccess({ rpc: async () => ({ data: true, error: null }) }), true);
  await assert.rejects(hasAdminAccess({ rpc: async () => ({ data: null, error: { message: "offline" } }) }), /Không xác minh/);
});
