import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage({ viewport: { width: 700, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://localhost:4322/dat-hang?product=ginger-shot", { waitUntil: "networkidle" });
await page.click("#step1-next");
await page.waitForSelector('[data-step="2"]:not([hidden])');
await page.click('[data-next="3"]');
await page.waitForSelector('[data-step="3"]:not([hidden])');
await page.fill("#customer-name", "Thankyou Redesign Test");
await page.fill("#phone", "0977888999");
await page.fill("#address", "1 Thankyou St");
await page.click('[data-next="4"]');
await page.waitForSelector('[data-step="4"]:not([hidden])');
await page.click('#order-form button[type="submit"]');
await page.waitForSelector("#thank-you:not([hidden])");

await page.screenshot({ path: ".verify/thankyou-redesign.png" });

const code = await page.locator("#order-id").textContent();
console.log("Order code shown:", code);

await page.click("#copy-order-id");
await page.waitForTimeout(300);
const copiedText = await page.locator("#copy-order-id").textContent();
console.log("Copy button text after click:", copiedText);
const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
console.log("Clipboard content matches code:", clipboardText === code);

console.log("errors:", errors.length ? errors : "none");
await browser.close();
