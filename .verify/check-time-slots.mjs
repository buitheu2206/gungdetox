import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.selectOption("#product-select", { index: 1 });
await page.click("#add-to-cart");
await page.click("#step1-next");
await page.waitForTimeout(300);
await page.screenshot({ path: ".verify/time-slots-step2.png" });

// Try to proceed without filling date/slot -> should block
await page.click("[data-next='3']");
await page.waitForTimeout(200);
const currentStep = await page.evaluate(() => document.querySelector(".step:not([hidden])")?.getAttribute("data-step"));
console.log("step after trying to skip (should stay 2):", currentStep);

// Fill date, still no slot -> should still block
await page.fill("#delivery-date", "2026-09-25");
await page.click("[data-next='3']");
await page.waitForTimeout(200);
const step2 = await page.evaluate(() => document.querySelector(".step:not([hidden])")?.getAttribute("data-step"));
console.log("step after date only (should stay 2):", step2);

// Select a slot, now should proceed
await page.click('input[name="delivery-slot"][value="13h-17h"]');
await page.click("[data-next='3']");
await page.waitForTimeout(200);
const step3 = await page.evaluate(() => document.querySelector(".step:not([hidden])")?.getAttribute("data-step"));
console.log("step after selecting slot (should be 3):", step3);

await browser.close();
