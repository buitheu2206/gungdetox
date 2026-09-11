import { chromium, devices } from "playwright";
const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone 13"] });
const page = await context.newPage();
await page.goto("http://localhost:4322/", { waitUntil: "networkidle" });
// Viewport-only screenshot at natural scroll position (not fullPage) - true representation
await page.screenshot({ path: ".verify/mobile-home-viewport.png" });
// scroll to the why-us section and screenshot viewport there too
await page.evaluate(() => document.querySelector(".why-grid")?.scrollIntoView());
await page.waitForTimeout(300);
await page.screenshot({ path: ".verify/mobile-home-scrolled.png" });
await browser.close();
