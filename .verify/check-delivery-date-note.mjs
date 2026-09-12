import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://localhost:4322/dat-hang?product=ginger-shot", { waitUntil: "networkidle" });
await page.click("#step1-next");
await page.waitForSelector('[data-step="2"]:not([hidden])');

// Try advancing WITHOUT picking a date first — should be blocked
await page.click('[data-next="3"]');
await page.waitForTimeout(300);
let step = await page.locator(".step:not([hidden])").getAttribute("data-step");
console.log("Step after clicking next with NO delivery date (expect 2, blocked):", step);

await page.fill("#delivery-date", "2026-09-20");
await page.fill("#delivery-time", "14:30");
await page.fill("#delivery-note", "Gọi trước 15 phút, để ở cổng giúp mình");
await page.click('[data-next="3"]');
await page.waitForSelector('[data-step="3"]:not([hidden])');
step = await page.locator(".step:not([hidden])").getAttribute("data-step");
console.log("Step after filling delivery date and clicking next (expect 3):", step);

await page.fill("#customer-name", "Delivery Date Note Test");
await page.fill("#phone", "0944333222");
await page.fill("#address", "1 Note Test St");
await page.click('[data-next="4"]');
await page.waitForSelector('[data-step="4"]:not([hidden])');
const summary = await page.locator("#order-summary").innerText();
console.log("--- Step 4 summary ---");
console.log(summary);

await page.click('#order-form button[type="submit"]');
await page.waitForSelector("#thank-you:not([hidden])");
console.log("Order placed OK");

// Check admin
await page.goto("http://localhost:4322/admin/don-hang", { waitUntil: "networkidle" });
await page.fill('#admin-login-form input[name="email"]', "buitheu698@gmail.com");
await page.fill('#admin-login-form input[name="password"]', "Buitheu698@");
await page.click('#admin-login-form button[type="submit"]');
await page.waitForSelector("#orders-table", { state: "visible", timeout: 10000 });
await page.waitForTimeout(1000);

const rowText = await page.locator('tr:has-text("0944333222")').innerText();
console.log("--- Admin row ---");
console.log(rowText);
console.log("Shows correct date:", rowText.includes("20/09/2026"));
console.log("Shows correct time:", rowText.includes("14:30"));
console.log("Shows customer note:", rowText.includes("Gọi trước 15 phút"));

console.log("errors:", errors.length ? errors : "none");
await browser.close();
