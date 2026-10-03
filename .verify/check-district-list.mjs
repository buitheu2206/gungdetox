import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.selectOption("#product-select", { index: 1 });
await page.click("text=+ Thêm vào giỏ hàng");
await page.click("#step1-next");
await page.waitForSelector('section[data-step="2"]:not([hidden])');
await page.fill("#delivery-date", "2026-09-25");
await page.click('.slot-option:has-text("Sáng")');
await page.click('[data-next="3"]');
await page.waitForSelector('section[data-step="3"]:not([hidden])');

const options = await page.locator("#district option").allTextContents();
console.log(options);
await page.screenshot({ path: ".verify/step3-district.png" });
await browser.close();
