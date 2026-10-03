import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://localhost:4321/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const metas = await page.locator(".combo-card .meta").allInnerTexts();
console.log("combo card meta lines:", metas);

// detail page still has full text
await page.goto("http://localhost:4321/san-pham/combo-thang-ginger-shot", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const detailMeta = await page.locator("#p-meta").innerText().catch(() => "n/a");
console.log("product detail page meta:", detailMeta);
await browser.close();
