import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:4322/", { waitUntil: "networkidle" });
const promo = page.locator(".set-detox-promo");
await promo.scrollIntoViewIfNeeded();
await promo.screenshot({ path: ".verify/set-promo.png" });
await browser.close();
