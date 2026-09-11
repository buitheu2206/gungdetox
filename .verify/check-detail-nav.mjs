import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://localhost:4322/san-pham", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".product-card");
await page.click(".product-card .media");
await page.waitForSelector(".detail-page");
console.log("Navigated to:", page.url());
console.log("Detail h1:", await page.$eval("#p-name", (el) => el.textContent));
console.log("errors:", errors.length ? errors : "none");
await browser.close();
