import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const failed = [];
page.on("response", (r) => { if (r.status() >= 400) failed.push(r.status() + " " + r.url()); });
await page.goto("https://gungdetox.com/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const imgs = await page.evaluate(() => Array.from(document.querySelectorAll("img")).map(img => ({
  src: img.getAttribute("src"), naturalWidth: img.naturalWidth, complete: img.complete
})));
console.log("broken imgs:", JSON.stringify(imgs.filter(i => i.naturalWidth === 0), null, 2));
console.log("failed requests:", failed);
console.log("total imgs:", imgs.length);
await browser.close();
