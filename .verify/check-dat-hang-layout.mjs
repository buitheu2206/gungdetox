import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://localhost:4322/dat-hang", { waitUntil: "networkidle" });
await page.screenshot({ path: ".verify/dat-hang-step1.png", fullPage: true });

await page.selectOption("#product-select", "ginger-shot");
await page.click("#add-to-cart");
await page.waitForTimeout(200);
await page.click("#step1-next");
await page.waitForSelector('[data-step="2"]:not([hidden])');
await page.fill("#delivery-date", "2026-09-20");
await page.click('[data-next="3"]');
await page.waitForSelector('[data-step="3"]:not([hidden])');
await page.screenshot({ path: ".verify/dat-hang-step3.png", fullPage: true });
await page.fill("#customer-name", "Layout Test");
await page.fill("#phone", "0900111222");
await page.fill("#address", "1 Layout St");
await page.click('[data-next="4"]');
await page.waitForSelector('[data-step="4"]:not([hidden])');
await page.screenshot({ path: ".verify/dat-hang-step4.png", fullPage: true });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
