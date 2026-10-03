import { chromium } from "playwright";
import path from "path";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("http://localhost:4321/admin/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// login
await page.fill('input[name="email"]', "buitheu698@gmail.com").catch(() => {});
console.log("login form present:", await page.locator('input[name="email"]').isVisible().catch(() => false));
await browser.close();
