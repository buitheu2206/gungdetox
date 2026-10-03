import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://localhost:4322/", { waitUntil: "networkidle" });
await page.waitForTimeout(300);

const before = await page.evaluate(() => Array.from(document.querySelectorAll("img")).map(img => ({
  src: img.getAttribute("src"), naturalWidth: img.naturalWidth, top: img.getBoundingClientRect().top
})));
console.log("before scroll, broken:", before.filter(i => i.naturalWidth === 0).length, "total:", before.length);

// scroll to bottom in steps to trigger lazy-load
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 150));
  }
});
await page.waitForTimeout(800);

const after = await page.evaluate(() => Array.from(document.querySelectorAll("img")).map(img => ({
  src: img.getAttribute("src"), naturalWidth: img.naturalWidth
})));
console.log("after scroll, broken:", after.filter(i => i.naturalWidth === 0));
await browser.close();
