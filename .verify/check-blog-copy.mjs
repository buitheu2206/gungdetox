import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
await page.goto("http://localhost:4321/blog/uong-nuoc-ep-cu-den-dung-cach", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const text = await page.locator("#p-body").innerText();
console.log(text);
