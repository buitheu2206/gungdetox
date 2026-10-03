import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
await page.goto("http://localhost:4321/nhuong-quyen", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const color = await page.evaluate(() => {
  const el = document.querySelector(".package-card.theme-online");
  return el ? getComputedStyle(el).borderTopColor : "not found";
});
console.log("border-top-color:", color);
await browser.close();
