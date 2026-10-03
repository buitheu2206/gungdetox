import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
await page.goto("https://gungdetox.com/san-pham/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const cards = page.locator("#single-grid .product-card");
const count = await cards.count();
console.log("card count:", count);

for (let i = 0; i < Math.min(count, 4); i++) {
  const card = cards.nth(i);
  const name = await card.locator("h3").innerText();
  const cardBox = await card.boundingBox();
  const mediaBox = await card.locator(".media").boundingBox();
  const bodyBox = await card.locator(".body").boundingBox();
  const footerBox = await card.locator(".footer-row").boundingBox();
  console.log(JSON.stringify({ name, cardBox, mediaBox, bodyBox, footerBox }));
}

await page.screenshot({ path: ".verify/san-pham-row1.png", clip: { x: 0, y: 0, width: 1400, height: 900 } });
await browser.close();
