import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("http://localhost:4321/lien-he", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: ".verify/lien-he-zalo-qr.png" });
await browser.close();
