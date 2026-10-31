import assert from "node:assert/strict";
import { test } from "node:test";
import { getDetoxPackageProducts } from "../src/lib/detox-packages.ts";
import { getOrderAmount, snapshotOrderItems } from "../src/lib/order-pricing.ts";

test("should carry the selected Detox package price and bottle count into checkout", () => {
  const products = getDetoxPackageProducts();
  const expectedPackages = [
    ["detox-5-chai-1-ngay", 269000, 5],
    ["detox-5-chai-3-ngay", 750000, 15],
    ["detox-5-chai-5-ngay", 1250000, 25],
    ["detox-5-chai-7-ngay", 1750000, 35],
  ];
  assert.equal(products.length, expectedPackages.length);
  for (const [slug, price, bottles] of expectedPackages) {
    const product = products.find((item) => item.slug === slug);
    assert.ok(product, `${slug} must be included in the product setup`);
    assert.equal(product.servings, bottles);
    const orderItems = snapshotOrderItems([{ slug, quantity: 2 }], products);
    assert.equal(getOrderAmount(orderItems), price * 2);
  }
});
