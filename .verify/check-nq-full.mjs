import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto("http://localhost:4321/nhuong-quyen", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: ".verify/nq-full.png", fullPage: true });
await browser.close();
