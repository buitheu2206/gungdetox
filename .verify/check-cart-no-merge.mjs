import { chromium } from "playwright";

const PORT = process.argv[2] || "4322";
const BASE = `http://localhost:${PORT}`;
const TEST_PHONE = "0955444333";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1200 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto(`${BASE}/dat-hang`, { waitUntil: "networkidle" });

// Add bia-gung twice without changing the dropdown — should become 2 separate lines, not merged
await page.selectOption("#product-select", "bia-gung");
await page.fill("#quantity", "1");
await page.click("#add-to-cart");
await page.waitForTimeout(150);
await page.click("#add-to-cart");
await page.waitForTimeout(150);

const lineCount = await page.locator(".cart-item").count();
console.log("Number of cart lines after adding same product twice:", lineCount);
const cartText = await page.locator("#cart-list").innerText();
console.log(cartText);

// Remove just the first line, confirm only 1 removed (not both, not by slug-match)
await page.click('.remove-item[data-index="0"]');
await page.waitForTimeout(150);
const remainingCount = await page.locator(".cart-item").count();
console.log("Remaining lines after removing 1:", remainingCount);
console.log(await page.locator("#cart-list").innerText());

console.log("errors:", errors.length ? errors : "none");
await browser.close();
