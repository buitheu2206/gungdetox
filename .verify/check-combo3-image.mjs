import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });

await page.goto("http://localhost:4322/san-pham/combo-3-thang-ginger-shot", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: ".verify/combo3-detail.png", fullPage: true });

await page.goto("http://localhost:4322/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const card = page.locator(".combo-card", { hasText: "Combo 3 tháng" });
await card.scrollIntoViewIfNeeded();
await page.screenshot({ path: ".verify/combo3-listing.png" });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
