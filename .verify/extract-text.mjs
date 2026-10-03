import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const pages = [
  "/", "/san-pham", "/dat-hang", "/lien-he", "/blog",
  "/chinh-sach/doi-tra-chai", "/chinh-sach/giao-hang", "/chinh-sach/thanh-toan",
];

for (const p of pages) {
  await page.goto(`https://gungdetox.com${p}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const text = await page.evaluate(() => document.body.innerText);
  console.log(`\n\n========== ${p} ==========\n${text}`);
}
await browser.close();
