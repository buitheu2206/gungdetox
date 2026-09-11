import { chromium } from "playwright";
import path from "path";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("dialog", async (d) => {
  if (d.type() === "confirm") await d.accept();
  else { errors.push("alert: " + d.message()); await d.dismiss(); }
});

await page.goto("http://localhost:4322/admin/san-pham", { waitUntil: "domcontentloaded" });
const alreadyIn = await page
  .waitForSelector("#admin-content:not([hidden])", { timeout: 3000 })
  .then(() => true).catch(() => false);
if (!alreadyIn) {
  await page.fill('#admin-login-form input[name="email"]', "buitheu698@gmail.com");
  await page.fill('#admin-login-form input[name="password"]', "Buitheu698@");
  await page.click('#admin-login-form button[type="submit"]');
  await page.waitForSelector("#admin-content:not([hidden])", { timeout: 10000 });
}
await page.waitForSelector("#products-body tr");

// Thêm sản phẩm test kèm 2 ảnh phụ
await page.fill("#f-slug", "test-gallery-product");
await page.fill("#f-name", "Test Gallery Product");
await page.selectOption("#f-type", "single");
await page.fill("#f-price-retail", "10000");

const testFiles = [
  path.resolve("public/images/products/bia-gung.webp"),
  path.resolve("public/images/products/kombucha.webp"),
];
await page.setInputFiles("#f-gallery", testFiles);

const previewCountBeforeSave = await page.$$eval(".gallery-thumb-wrap", (els) => els.length);
console.log("Gallery previews before save (should be 0, only shows after save/reload for new item):", previewCountBeforeSave);

await page.click("button.save-btn");
await page.waitForFunction(
  () => document.querySelector("#products-body")?.textContent?.includes("Test Gallery Product"),
  { timeout: 15000 }
);
console.log("Product with gallery images saved");

// Sửa lại để kiểm tra gallery_images đã lưu đúng và hiện preview khi edit
const row = page.locator("tr", { hasText: "Test Gallery Product" });
await row.locator(".edit-btn").click();
await page.waitForTimeout(300);
const previewCountAfterEdit = await page.$$eval(".gallery-thumb-wrap", (els) => els.length);
console.log("Gallery previews when editing (should be 2):", previewCountAfterEdit);

// Xoá 1 ảnh phụ bằng nút x, rồi lưu lại
await page.click(".remove-gallery-img");
await page.click("button.save-btn");
await page.waitForTimeout(500);

await row.locator(".edit-btn").click();
await page.waitForTimeout(300);
const previewCountAfterRemove = await page.$$eval(".gallery-thumb-wrap", (els) => els.length);
console.log("Gallery previews after removing 1 and re-saving (should be 1):", previewCountAfterRemove);

await page.screenshot({ path: ".verify/admin-gallery.png" });

// Dọn dẹp: xoá sản phẩm test
await page.click("#cancel-edit");
await row.locator(".delete-btn").click();
await page.waitForFunction(
  () => !document.querySelector("#products-body")?.textContent?.includes("Test Gallery Product"),
  { timeout: 10000 }
);
console.log("Test product cleaned up");

console.log("errors:", errors.length ? errors : "none");
await browser.close();
