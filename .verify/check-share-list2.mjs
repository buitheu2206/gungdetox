import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1100, height: 900 });

await page.goto("http://localhost:4321/san-pham", { waitUntil: "networkidle" });
await page.waitForSelector(".share-fb-btn");

const first = page.locator(".share-fb-btn").first();
await first.click();
await page.waitForTimeout(200);
const firstUrl = await page.locator("#share-url-input").inputValue();
console.log("after clicking card #1, modal url:", firstUrl);

await page.click(".share-modal-close");
await page.waitForTimeout(150);

const second = page.locator(".share-fb-btn").nth(1);
const secondDataUrl = await second.getAttribute("data-share-url");
await second.click();
await page.waitForTimeout(200);
const secondUrl = await page.locator("#share-url-input").inputValue();
console.log("card #2 data-url:", secondDataUrl, "| modal now shows:", secondUrl);
console.log("MATCH:", secondDataUrl === secondUrl && secondUrl !== firstUrl);

await browser.close();
