import assert from "node:assert/strict";
import { test } from "node:test";
import { slugify } from "../src/lib/slug.ts";

test("should produce lowercase dash-separated ASCII slugs from Vietnamese titles", () => {
  assert.equal(slugify("Ginger Shot Cam"), "ginger-shot-cam");
  assert.equal(slugify("DETOX NGÀY 5 CHAI"), "detox-ngay-5-chai");
  assert.equal(slugify("Combo nhậu"), "combo-nhau");
  assert.equal(slugify("Đặt hàng"), "dat-hang");
});

test("should collapse repeated separators and trim leading/trailing dashes", () => {
  assert.equal(slugify("  ginger   shot  "), "ginger-shot");
  assert.equal(slugify("-ginger-shot-"), "ginger-shot");
  assert.equal(slugify("ginger_shot!!"), "ginger-shot");
});

test("should leave an already-clean slug unchanged", () => {
  assert.equal(slugify("ginger-shot-cam"), "ginger-shot-cam");
});
