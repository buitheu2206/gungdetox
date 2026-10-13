import assert from "node:assert/strict";
import { test } from "node:test";
import { getProductUnitPrice, snapshotOrderItems, getOrderAmount } from "../src/lib/order-pricing.ts";

test("should snapshot retail and package prices without changing the cart", () => {
  const cart = [{ slug: "juice", quantity: 2 }, { slug: "combo", quantity: 1 }, { slug: "set", quantity: 3 }];
  const products = [
    { slug: "juice", type: "single", price_retail: 40000, price: 999000 },
    { slug: "combo", type: "combo", price: 210000, price_retail: 999000 },
    { slug: "set", type: "set", price: 160000 },
  ];
  const items = snapshotOrderItems(cart, products);
  assert.deepEqual(items, [
    { productSlug: "juice", quantity: 2, unitPrice: 40000 },
    { productSlug: "combo", quantity: 1, unitPrice: 210000 },
    { productSlug: "set", quantity: 3, unitPrice: 160000 },
  ]);
  products[0].price_retail = 60000;
  assert.equal(getOrderAmount(items), 770000);
  assert.equal(cart[0].unitPrice, undefined);
});

test("should leave legacy and partially priced order amounts unknown", () => {
  assert.equal(getOrderAmount([{ productSlug: "old", quantity: 2 }]), null);
  assert.equal(getOrderAmount([
    { productSlug: "known", quantity: 1, unitPrice: 50000 },
    { productSlug: "unknown", quantity: 1, unitPrice: null },
  ]), null);
  assert.equal(getOrderAmount([]), null);
});

test("should snapshot missing or invalid product prices as unknown", () => {
  for (const price of [undefined, null, -1, NaN, Infinity, "40000"]) {
    assert.equal(getProductUnitPrice({ slug: "combo", type: "combo", price }), null);
  }
  const items = snapshotOrderItems([{ slug: "deleted", quantity: 1 }], []);
  assert.equal(items[0].unitPrice, null);
  assert.equal(getOrderAmount(items), null);
});

test("should allow a zero price and reject malformed money or quantities", () => {
  assert.equal(getOrderAmount([{ productSlug: "free", quantity: 2, unitPrice: 0 }]), 0);
  for (const quantity of [0, -1, 1.5, "2", NaN]) {
    assert.equal(getOrderAmount([{ productSlug: "juice", quantity, unitPrice: 40000 }]), null);
  }
  for (const unitPrice of [-1, NaN, Infinity, "40000"]) {
    assert.equal(getOrderAmount([{ productSlug: "juice", quantity: 1, unitPrice }]), null);
  }
  assert.equal(getOrderAmount([{ productSlug: "overflow", quantity: 2, unitPrice: Number.MAX_VALUE }]), null);
});
