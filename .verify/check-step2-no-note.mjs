import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });

// add a product to cart to enable step1-next
await page.selectOption("#product-select", { index: 1 });
await page.click("text=+ Thêm vào giỏ hàng");
await page.click("#step1-next");
await page.waitForSelector('section[data-step="2"]:not([hidden])');
await page.screenshot({ path: ".verify/step2-no-note.png", fullPage: false });

const bodyText = await page.locator('section[data-step="2"]').innerText();
console.log("Contains old note:", bodyText.includes("Tiệm giao hàng tất cả các ngày"));

await browser.close();
