import assert from "node:assert/strict";
import { test } from "node:test";
import { assertCheckoutAvailable, getCartBottleType, getCheckoutProducts, getInitialCheckoutItem } from "../src/lib/checkout-products.ts";
import { localDateValue } from "../src/lib/local-date.ts";

function productsClient(result) {
  const calls = [];
  const query = {
    select() { return query; },
    eq(...args) { calls.push(args); return query; },
    async order() { return result; },
    async in(...args) { calls.push(args); return result; },
  };
  return { calls, from(table) { assert.equal(table, "products"); return query; } };
}

test("should preselect the chosen product and pack quantity from a purchase link", () => {
  const products = [{ slug: "combo-loc-bia-gung" }];
  assert.deepEqual(getInitialCheckoutItem("?product=combo-loc-bia-gung&quantity=3", products), {
    slug: "combo-loc-bia-gung", quantity: 3,
  });
  assert.equal(getInitialCheckoutItem("?product=unknown&quantity=3", products), null);
  assert.equal(getInitialCheckoutItem("", products), null);
});

test("should default invalid purchase link quantities to one pack", () => {
  const products = [{ slug: "combo-loc-bia-gung" }];
  for (const value of ["", "0", "-1", "1.5", "abc", "Infinity", "9007199254740992"]) {
    const item = getInitialCheckoutItem(`?product=combo-loc-bia-gung&quantity=${value}`, products);
    assert.equal(item.quantity, 1);
  }
  assert.equal(getInitialCheckoutItem("?product=combo-loc-bia-gung", products).quantity, 1);
});

test("should request only products explicitly available for checkout", async () => {
  const products = [{ slug: "ginger", in_stock: true }];
  const client = productsClient({ data: products, error: null });
  assert.deepEqual(await getCheckoutProducts(client), products);
  assert.deepEqual(client.calls, [["in_stock", true]]);
});

test("should block missing or unavailable products before displaying payment details", async () => {
  for (const data of [[], [{ slug: "ginger", name: "Gừng", in_stock: false }], [{ slug: "ginger", in_stock: null }]]) {
    const client = productsClient({ data, error: null });
    await assert.rejects(assertCheckoutAvailable(client, [{ slug: "ginger" }]), /không còn bán/);
  }
});

test("should allow any positive order quantity while the daily availability flag is true", async () => {
  const client = productsClient({ data: [{ slug: "ginger", in_stock: true }], error: null });
  await assertCheckoutAvailable(client, [{ slug: "ginger", quantity: 100 }]);
  assert.deepEqual(client.calls, [["slug", ["ginger"]]]);
});

test("should block payment when the availability check fails or the cart is empty", async () => {
  const client = productsClient({ data: null, error: new Error("offline") });
  await assert.rejects(assertCheckoutAvailable(client, [{ slug: "ginger" }]), /Không kiểm tra được/);
  await assert.rejects(assertCheckoutAvailable(client, []), /chọn sản phẩm/);
  await assert.rejects(getCheckoutProducts(client), /Không tải được/);
});

test("should send plastic only when no product in the cart comes in glass", () => {
  const products = [
    { slug: "detox", bottle_options: ["plastic"] },
    { slug: "shot", bottle_options: ["glass", "plastic"] },
    { slug: "legacy", bottle_options: null },
  ];
  assert.equal(getCartBottleType([{ slug: "detox" }], products), "plastic");
  assert.equal(getCartBottleType([{ slug: "detox" }, { slug: "shot" }], products), "glass");
  assert.equal(getCartBottleType([{ slug: "legacy" }], products), "glass");
  assert.equal(getCartBottleType([], products), "glass");
});

test("should use the local calendar day for the earliest delivery date", () => {
  // 1am local on 5 Jan is still 4 Jan in UTC for timezones ahead of UTC, like Vietnam.
  assert.equal(localDateValue(new Date(2026, 0, 5, 1)), "2026-01-05");
});
