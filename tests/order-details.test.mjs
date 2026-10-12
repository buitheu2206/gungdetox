import assert from "node:assert/strict";
import { test } from "node:test";
import { getOrderCodeBounds, getDeliveryDetails } from "../src/lib/order-details.ts";

test("should bound an order lookup to the phone suffix and UUID prefix", () => {
  const bounds = getOrderCodeBounds("123456-abcdef");
  assert.deepEqual(bounds, {
    code: "123456-ABCDEF", phoneSuffix: "123456",
    minId: "ABCDEF00-0000-0000-0000-000000000000",
    maxId: "ABCDEFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
  });
  for (const prefix of ["000000", "FFFFFF"]) {
    assert.match(getOrderCodeBounds(`000000-${prefix}`).maxId, /^[A-F0-9]{8}-[A-F0-9-]{27}$/);
  }
});

test("should reject malformed order codes before querying orders", () => {
  for (const code of ["", "12345-ABCDEF", "123456-ABCDEG", "123456-ABCDEF/other", "%_", "<script>"]) {
    assert.equal(getOrderCodeBounds(code), null);
  }
});

test("should preserve delivery date, time and customer notes from checkout", () => {
  const note = "Giao ngày 12/10/2026 (Chiều (13h - 17h)). Ghi chú của khách: Gọi trước. Giao ở cổng. Phí ship tùy khoảng cách.";
  assert.deepEqual(getDeliveryDetails(note), {
    date: "12/10/2026", time: "Chiều (13h - 17h)", schedule: "12/10/2026 (Chiều (13h - 17h))",
    note: "Gọi trước. Giao ở cổng",
  });
});

test("should support legacy orders without a delivery schedule or note", () => {
  assert.equal(getDeliveryDetails(null).date, "—");
  assert.equal(getDeliveryDetails("Phí ship tính theo khoảng cách").schedule, "Chưa có lịch giao");
  assert.equal(getDeliveryDetails("Giao ngày 12/10/2026. Ghi chú của khách: (không có). Phí ship tùy khoảng cách.").note, "—");
});
