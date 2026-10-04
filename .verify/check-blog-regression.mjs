import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1000, height: 900 });

const slugs = [
  "kombucha-loi-khuan-tu-dau",
  "vi-sao-uong-ginger-shot-moi-sang",
  "DETOX NGÀY 5 CHAI",
];
for (const slug of slugs) {
  await page.goto(`http://localhost:4321/blog/${encodeURIComponent(slug)}`, { waitUntil: "networkidle" });
  const paraCount = await page.locator("#p-body p").count();
  console.log(slug, "-> số đoạn <p>:", paraCount);
}
await browser.close();
