// Verify that equal-size Ginger Shot packages remain distinct and milk labels stay unchanged.
// Run: node --experimental-strip-types .verify/check-ginger-combo-options.mjs
import assert from "node:assert/strict";
import { comboVariantGroupCardHtml } from "../src/lib/templates.ts";

const variants = [
  { slug: "combo-3-thang-ginger-shot", name: "4 tháng", price: 2000000, servings: 112 },
  { slug: "combo-2-thang-dau-ginger-shot", name: "2 tháng đầu", price: 1100000, servings: 56 },
  { slug: "combo-2-thang-sau-ginger-shot", name: "2 tháng sau", price: 1100000, servings: 56 },
];
const labels = ["4 tháng — 112 chai", "2 tháng đầu — Cam + Xanh", "2 tháng sau — Đỏ + Thơm"];
const html = comboVariantGroupCardHtml("Combo Ginger Shot", variants, labels);
assert.ok(html.includes("<legend>Chọn gói</legend>"));
for (const label of labels) assert.ok(html.includes(label));
assert.ok(html.includes("2.000.000đ"));
assert.ok(html.includes("/dat-hang?product=combo-3-thang-ginger-shot"));
const encodedVariants = html.match(/data-variants='([^']+)'/)[1];
const packageData = JSON.parse(encodedVariants.replaceAll("&quot;", '"'));
assert.deepEqual(packageData.map(({ slug, price }) => ({ slug, price })),
  variants.map(({ slug, price }) => ({ slug, price })));
const milkHtml = comboVariantGroupCardHtml("Combo Sữa hạt", [{ ...variants[0], servings: 3 }]);
assert.ok(milkHtml.includes("<legend>Chọn số chai</legend>"));
assert.ok(milkHtml.includes("3 chai</label>"));
const escapedHtml = comboVariantGroupCardHtml("Combo Ginger Shot", variants, ["<script>"]);
assert.ok(escapedHtml.includes("&lt;script&gt;"));
console.log("PASS: distinct two-month packages, prices, ordering data, milk labels, escaping.");
