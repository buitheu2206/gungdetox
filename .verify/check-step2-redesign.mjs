import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 900 });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });

await page.selectOption("#product-select", { index: 1 });
await page.click("text=+ Thêm vào giỏ hàng");
await page.click("#step1-next");
await page.waitForSelector('section[data-step="2"]:not([hidden])');
await page.screenshot({ path: ".verify/step2-redesign.png", fullPage: false });

// click the "Chiều" option to check the checked state visual
await page.click('.slot-option:has-text("Chiều")');
await page.screenshot({ path: ".verify/step2-redesign-checked.png", fullPage: false });

// mobile viewport
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: ".verify/step2-redesign-mobile.png", fullPage: false });

await browser.close();
