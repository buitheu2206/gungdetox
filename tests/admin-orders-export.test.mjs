import assert from "node:assert/strict";
import { test } from "node:test";
import { exportOrdersCsv, orderToCsvRow } from "../src/lib/admin-orders/csv.ts";

const order = {
  id: "abcdef00-0000-4000-8000-000000000001", phone: "0900123456", customer_name: "Khách thử",
  address: "Địa chỉ thử", district: "Quận 3", created_at: "2026-10-01T00:00:00Z",
  delivery_date: "2026-10-20", delivery_time: "8h-12h", delivery_note: "Gọi trước",
  items: [{ productSlug: "juice", quantity: 2, unitPrice: 40000 }], bottles_returned: 1,
  payment_method: "bank_transfer", paid: false, status: "processing",
};
const products = [{ slug: "juice", name: 'Nước ép "thử"', type: "single", price_retail: 90000 }];

test("should retain all admin CSV columns and the saved price when product prices change", () => {
  const row = orderToCsvRow(order, products);
  assert.equal(row.length, 16);
  assert.equal(row[0], "123456-ABCDEF");
  assert.deepEqual(row.slice(5, 8), ["20/10/2026", "8h-12h", "Gọi trước"]);
  assert.deepEqual(row.slice(8, 12), ['Nước ép "thử"', "40.000đ", "2", "80.000đ"]);
  assert.deepEqual(row.slice(12), ["1", "Chuyển khoản", "Chưa thanh toán", "Đang xử lý"]);
  const unknown = orderToCsvRow({ ...order, items: [{ productSlug: "deleted", quantity: 1 }] }, []);
  assert.deepEqual(unknown.slice(8, 12), ["deleted", "—", "1", "—"]);
});

test("should download every supplied order as UTF-8 CSV with safe formula and quote escaping", async () => {
  const originalDocument = globalThis.document;
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  let blob;
  let clicked = false;
  let revoked;
  const link = { href: "", download: "", click() { clicked = true; } };
  globalThis.document = { createElement(tag) { assert.equal(tag, "a"); return link; } };
  URL.createObjectURL = (value) => { blob = value; return "blob:test"; };
  URL.revokeObjectURL = (value) => { revoked = value; };
  try {
    exportOrdersCsv([order, { ...order, customer_name: "=1+1", status: "delivered", paid: true }], products);
    const bytes = Buffer.from(await blob.arrayBuffer());
    assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
    const csv = bytes.toString("utf8");
    assert.equal(csv.split("\r\n").length, 3);
    assert.ok(csv.includes('"Nước ép ""thử"""'));
    assert.ok(csv.includes('"\'=1+1"'));
    assert.ok(csv.includes('"Đã thanh toán","Đã giao"'));
    assert.equal(clicked, true);
    assert.match(link.download, /^don-hang-\d{4}-\d{2}-\d{2}\.csv$/);
    assert.equal(revoked, "blob:test");
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  }
});

test("should preserve address punctuation and newlines in CSV fields", () => {
  const address = 'A & B <Block>, "Floor 2"\nDoor 3';
  assert.equal(orderToCsvRow({ ...order, address, district: "Q '1'" }, products)[4], `${address}, Q '1'`);
});
