import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://localhost:4322/dat-hang", { waitUntil: "networkidle" });

await page.selectOption("#product-select", "juice-ep-tuoi");
await page.fill("#quantity", "1");
await page.click("#add-to-cart");
await page.waitForTimeout(200);

await page.selectOption("#product-select", "cu-den-gung-ngam");
await page.click("#add-to-cart");
await page.waitForTimeout(200);

await page.screenshot({ path: ".verify/cart-redesign-1.png" });

// Test quantity stepper: increase juice-ep-tuoi qty via + button
await page.click('.cart-item:has-text("Juice ép tươi") .qty-increase');
await page.waitForTimeout(200);
await page.click('.cart-item:has-text("Juice ép tươi") .qty-increase');
await page.waitForTimeout(200);
console.log("After +2 clicks:", await page.locator('.cart-item:has-text("Juice ép tươi") .qty-value').textContent());

// Decrease back down to 1 then to 0 (should auto-remove)
await page.click('.cart-item:has-text("Juice ép tươi") .qty-decrease');
await page.waitForTimeout(150);
await page.click('.cart-item:has-text("Juice ép tươi") .qty-decrease');
await page.waitForTimeout(150);
console.log("After -2 clicks:", await page.locator('.cart-item:has-text("Juice ép tươi") .qty-value').textContent());

await page.click('.cart-item:has-text("Juice ép tươi") .qty-decrease');
await page.waitForTimeout(200);
const juiceLineCount = await page.locator('.cart-item:has-text("Juice ép tươi")').count();
console.log("Juice line count after decreasing to 0 (should auto-remove):", juiceLineCount);

await page.screenshot({ path: ".verify/cart-redesign-2.png" });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
