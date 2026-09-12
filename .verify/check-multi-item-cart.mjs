import { chromium } from "playwright";

const PORT = process.argv[2] || "4322";
const BASE = `http://localhost:${PORT}`;
const TEST_PHONE = "0966555444";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(`${BASE}/dat-hang`, { waitUntil: "networkidle" });

// Add product 1: ginger-shot x2
await page.selectOption("#product-select", "ginger-shot");
await page.fill("#quantity", "2");
await page.click("#add-to-cart");
await page.waitForTimeout(200);

// Add product 2: kombucha x1
await page.selectOption("#product-select", "kombucha");
await page.fill("#quantity", "1");
await page.click("#add-to-cart");
await page.waitForTimeout(200);

// Add product 1 again (should merge quantity, ginger-shot becomes x3)
await page.selectOption("#product-select", "ginger-shot");
await page.fill("#quantity", "1");
await page.click("#add-to-cart");
await page.waitForTimeout(200);

const cartText = await page.locator("#cart-list").innerText();
console.log("--- Cart after adding 3 items (2 merged) ---");
console.log(cartText);

// Add product 3: bia-gung x1, then remove it to test remove button
await page.selectOption("#product-select", "bia-gung");
await page.fill("#quantity", "1");
await page.click("#add-to-cart");
await page.waitForTimeout(200);
await page.click('.cart-item:has-text("Bia Gừng") .remove-item');
await page.waitForTimeout(200);

const cartTextAfterRemove = await page.locator("#cart-list").innerText();
console.log("--- Cart after removing bia-gung ---");
console.log(cartTextAfterRemove);
console.log("bia-gung correctly removed:", !cartTextAfterRemove.includes("Bia Gừng"));

await page.screenshot({ path: ".verify/cart-step1.png", fullPage: true });

// Proceed through the flow
await page.click("#step1-next");
await page.waitForSelector('[data-step="2"]:not([hidden])');
await page.fill("#delivery-date", "2026-09-20");
await page.screenshot({ path: ".verify/cart-step2.png", fullPage: true });

await page.click('[data-next="3"]');
await page.waitForSelector('[data-step="3"]:not([hidden])');
await page.fill("#customer-name", "Multi Item Test");
await page.fill("#phone", TEST_PHONE);
await page.fill("#address", "456 Cart Test St");
await page.click('[data-next="4"]');
await page.waitForSelector('[data-step="4"]:not([hidden])');

const summaryText = await page.locator("#order-summary").innerText();
console.log("--- Step 4 summary ---");
console.log(summaryText);

await page.screenshot({ path: ".verify/cart-step4.png", fullPage: true });

await page.click('button[type="submit"]');
await page.waitForSelector("#thank-you:not([hidden])");
const code = await page.locator("#order-id").textContent();
console.log("Order placed, code:", code);

console.log("errors:", errors.length ? errors : "none");
await browser.close();
