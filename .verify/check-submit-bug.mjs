import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push("[console] " + m.text()); });
page.on("pageerror", (e) => errors.push("[pageerror] " + String(e)));
page.on("requestfailed", (r) => errors.push("[requestfailed] " + r.url() + " " + r.failure()?.errorText));
page.on("response", (r) => { if (r.status() >= 400) errors.push("[http " + r.status() + "] " + r.url()); });

await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.selectOption("#product-select", "ginger-shot");
await page.click("#add-to-cart");
await page.waitForTimeout(200);
await page.click("#step1-next");
await page.waitForSelector('[data-step="2"]:not([hidden])');
await page.fill("#delivery-date", "2026-09-20");
await page.click('[data-next="3"]');
await page.waitForSelector('[data-step="3"]:not([hidden])');
await page.fill("#customer-name", "Submit Bug Test");
await page.fill("#phone", "0988777666");
await page.fill("#address", "999 Bug Test St");
await page.click('[data-next="4"]');
await page.waitForSelector('[data-step="4"]:not([hidden])');
await page.screenshot({ path: ".verify/submit-bug-step4.png", fullPage: true });

console.log("payment method checked (bank_transfer default):", await page.locator('input[name="payment-method"][value="bank_transfer"]').isChecked());

const submitBtn = page.locator('#order-form button[type="submit"]');
console.log("submit button visible:", await submitBtn.isVisible());
console.log("submit button enabled:", await submitBtn.isEnabled());

await submitBtn.click();
await page.waitForTimeout(1500);

const thankYouHidden = await page.locator("#thank-you").isHidden();
console.log("thank-you still hidden after click (bad if true):", thankYouHidden);

console.log("--- errors/network issues ---");
console.log(errors.length ? errors.join("\n") : "none");

await browser.close();
