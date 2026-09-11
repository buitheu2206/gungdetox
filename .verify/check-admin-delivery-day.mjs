import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

// Place an order picking Thứ 6 explicitly
await page.goto("http://localhost:4322/dat-hang?product=ginger-shot", { waitUntil: "networkidle" });
await page.click("#step1-next");
await page.waitForSelector('[data-step="2"]:not([hidden])');
await page.selectOption("#delivery-day", "thu-6");
await page.click('[data-next="3"]');
await page.waitForSelector('[data-step="3"]:not([hidden])');
await page.fill("#customer-name", "Delivery Day Test");
await page.fill("#phone", "0955222111");
await page.fill("#address", "1 Delivery Test St");
await page.click('[data-next="4"]');
await page.waitForSelector('[data-step="4"]:not([hidden])');
const summaryText = await page.locator("#order-summary").innerText();
console.log("Step 4 summary includes delivery day:", summaryText.includes("Thứ 6"));
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

const row = page.locator('tr:has-text("0955222111")');
const rowText = await row.innerText();
console.log("--- Admin row for test order ---");
console.log(rowText);
console.log("Row shows Thứ 6 badge:", rowText.includes("Thứ 6"));

// Test delivery day filter
await page.click('#delivery-day-filter [data-delivery-day="thu-6"]');
await page.waitForTimeout(300);
const thu6Count = await page.locator('tr:has-text("0955222111")').count();
console.log("Row visible when filtering Thứ 6:", thu6Count === 1);

await page.click('#delivery-day-filter [data-delivery-day="thu-4"]');
await page.waitForTimeout(300);
const thu4Count = await page.locator('tr:has-text("0955222111")').count();
console.log("Row hidden when filtering Thứ 4 (expect 0):", thu4Count);

await page.screenshot({ path: ".verify/admin-delivery-day.png", fullPage: true });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
