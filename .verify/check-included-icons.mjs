import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:4322/nhuong-quyen", { waitUntil: "networkidle" });

const section = page.locator(".included-section");
await section.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await section.screenshot({ path: ".verify/included-desktop.png" });

await page.setViewportSize({ width: 390, height: 844 });
await section.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await section.screenshot({ path: ".verify/included-mobile.png" });

const items = await page.locator(".included-list li").allTextContents();
console.log(items);

await browser.close();
