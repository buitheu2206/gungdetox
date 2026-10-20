import assert from "node:assert/strict";
import { test } from "node:test";
import { assertCheckoutAvailable, getCheckoutProducts } from "../src/lib/checkout-products.ts";

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
