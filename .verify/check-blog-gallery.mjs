import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
await page.goto("http://localhost:4321/blog/kombucha-loi-khuan-tu-dau", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const thumbCount = await page.locator("#gallery-thumbs .thumb").count();
console.log("thumb count:", thumbCount);
const info = await page.evaluate(() => {
  const grid = document.querySelector(".post-layout");
  return grid ? getComputedStyle(grid).gridTemplateColumns : null;
});
console.log("post-layout columns:", info);
await page.screenshot({ path: ".verify/blog-gallery-check.png" });
await browser.close();
