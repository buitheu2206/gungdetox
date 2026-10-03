import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const h1s = await page.evaluate(() => Array.from(document.querySelectorAll("h1")).map(h => ({ text: h.textContent.trim(), visible: h.offsetParent !== null })));
console.log("H1s:", JSON.stringify(h1s, null, 2));

const imgs = await page.evaluate(() => Array.from(document.querySelectorAll("img")).map(img => ({
  src: img.getAttribute("src"), naturalWidth: img.naturalWidth, complete: img.complete
})));
console.log("Images:", JSON.stringify(imgs.filter(i => i.naturalWidth === 0), null, 2));
await browser.close();
