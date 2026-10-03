import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 1000 });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });

// Step 1
await page.selectOption("#product-select", { index: 1 });
await page.click("text=+ Thêm vào giỏ hàng");
await page.screenshot({ path: ".verify/full-step1.png" });

await page.click("#step1-next");
await page.waitForSelector('section[data-step="2"]:not([hidden])');
await page.screenshot({ path: ".verify/full-step2.png" });

// Step 2
await page.fill("#delivery-date", "2026-09-25");
await page.click('.option-card:has-text("Sáng")');
await page.click('[data-next="3"]');
await page.waitForSelector('section[data-step="3"]:not([hidden])');
await page.screenshot({ path: ".verify/full-step3.png" });

// Step 3
await page.fill("#customer-name", "Nguyễn Văn A");
await page.fill("#phone", "0912345678");
await page.fill("#address", "123 Đường ABC");
await page.click('[data-next="4"]');
await page.waitForSelector('section[data-step="4"]:not([hidden])');
await page.screenshot({ path: ".verify/full-step4.png", fullPage: true });

await browser.close();
