import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: ".verify/home-messy.png", fullPage: true });

await page.goto("http://localhost:4321/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: ".verify/sanpham-messy.png", fullPage: true });
await browser.close();
