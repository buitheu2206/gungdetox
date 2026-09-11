import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://localhost:4322/san-pham/ginger-shot", { waitUntil: "networkidle" });
await page.waitForSelector(".thumb");
const thumbCount = await page.$$eval(".thumb", (els) => els.length);
console.log("Thumbnail count:", thumbCount);

const srcBefore = await page.$eval("#gallery-main-img", (el) => el.getAttribute("src"));
await page.click('.thumb[data-src="/images/products/bia-gung.webp"]');
await page.waitForTimeout(200);
const srcAfter = await page.$eval("#gallery-main-img", (el) => el.getAttribute("src"));
console.log("Main image before:", srcBefore);
console.log("Main image after clicking thumb:", srcAfter);

await page.screenshot({ path: ".verify/gallery-test.png" });
console.log("errors:", errors.length ? errors : "none");
await browser.close();
