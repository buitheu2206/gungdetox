import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.waitForTimeout(400);

await page.selectOption("#product-select", { index: 1 });
await page.fill("#quantity", "4");
await page.click("#add-to-cart");
await page.waitForTimeout(200);
let qtyVal = await page.inputValue("#quantity");
console.log("quantity after first add-to-cart (should be 1):", qtyVal);

await page.selectOption("#product-select", { index: 2 });
qtyVal = await page.inputValue("#quantity");
console.log("quantity after changing product (should be 1):", qtyVal);

await page.fill("#quantity", "3");
await page.click("#add-to-cart");
await page.waitForTimeout(200);
const cartText = await page.locator("#cart-list").innerText();
console.log("cart contents:\n", cartText);

await browser.close();
