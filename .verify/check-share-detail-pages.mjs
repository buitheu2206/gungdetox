import { chromium } from "playwright";
const browser = await chromium.launch();
const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
await page.setViewportSize({ width: 900, height: 900 });

// Product detail page
await page.goto("http://localhost:4321/san-pham/bia-gung", { waitUntil: "networkidle" });
await page.click(".share-trigger");
await page.waitForTimeout(200);
const productUrl = await page.locator("#share-url-input").inputValue();
const productFb = await page.locator("[data-share-fb]").getAttribute("href");
console.log("PRODUCT PAGE — modal url:", productUrl);
console.log("PRODUCT PAGE — fb href:", productFb);
await page.click(".share-modal-close");
await page.waitForTimeout(150);

// Blog detail page
await page.goto("http://localhost:4321/blog/DETOX%20NG%C3%80Y%205%20CHAI", { waitUntil: "networkidle" });
await page.click(".share-trigger");
await page.waitForTimeout(200);
const blogUrl = await page.locator("#share-url-input").inputValue();
console.log("BLOG PAGE — modal url:", blogUrl);

await page.click("#share-copy-btn");
await page.waitForTimeout(300);
const btnText = await page.locator("#share-copy-btn").innerText();
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log("copy button text:", btnText, "| clipboard:", clip);

await browser.close();
