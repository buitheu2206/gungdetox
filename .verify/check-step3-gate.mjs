import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:4321";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push("[console] " + m.text()); });
page.on("pageerror", (e) => errors.push("[pageerror] " + String(e)));

await page.goto(`${BASE}/dat-hang`, { waitUntil: "networkidle" });
await page.selectOption("#product-select", "ginger-shot");
await page.click("#add-to-cart");
await page.waitForTimeout(200);
await page.click("#step1-next");
await page.waitForSelector('[data-step="2"]:not([hidden])');
await page.click('[data-next="3"]');
await page.waitForSelector('[data-step="3"]:not([hidden])');

await page.fill("#customer-name", "Gate Test");
await page.fill("#phone", "0988 777 666"); // invalid: contains spaces
await page.fill("#address", "999 Gate Test St");
await page.click('[data-next="4"]');
await page.waitForTimeout(500);

let step = await page.locator(".step:not([hidden])").getAttribute("data-step");
console.log("Step after clicking next with INVALID phone (expect 3, blocked):", step);

// Now fix the phone and try again
await page.fill("#phone", "0988777666");
await page.click('[data-next="4"]');
await page.waitForTimeout(300);
step = await page.locator(".step:not([hidden])").getAttribute("data-step");
console.log("Step after fixing phone and clicking next (expect 4):", step);

// Complete the order to confirm full flow still works
await page.click('#order-form button[type="submit"]');
await page.waitForTimeout(1000);
const thankYouVisible = await page.locator("#thank-you").isVisible();
console.log("Order submitted successfully (thank-you visible):", thankYouVisible);

console.log("errors:", errors.length ? errors : "none");
await browser.close();
