import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto("http://localhost:4321/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const html = await page.locator("#combo-groups").innerHTML();
console.log(html.slice(0, 3000));
