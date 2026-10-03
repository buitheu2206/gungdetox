import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 700 });
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.screenshot({ path: ".verify/header-mobile-collapsed.png" });

await page.click("#lookup-trigger");
await page.waitForTimeout(200);
await page.screenshot({ path: ".verify/lookup-modal-mobile.png" });
await browser.close();
