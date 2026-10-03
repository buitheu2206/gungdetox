import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 400 } });
await page.goto("http://localhost:4321/blog/kombucha-loi-khuan-tu-dau", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.screenshot({ path: ".verify/blog-header-top.png" });
await browser.close();
