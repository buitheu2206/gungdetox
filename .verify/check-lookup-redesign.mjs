import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 650 });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.click("#lookup-trigger");
await page.waitForTimeout(200);
await page.screenshot({ path: ".verify/lookup-redesign.png" });

// with result
await page.fill('#lookup-form input[name="phone"]', "0912345678");
await page.click('#lookup-form button[type="submit"]');
await page.waitForTimeout(500);
await page.screenshot({ path: ".verify/lookup-redesign-result.png" });

await browser.close();
