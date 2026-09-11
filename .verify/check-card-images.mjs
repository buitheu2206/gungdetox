import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 2000 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });

await page.goto("http://localhost:4322/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const cards = await page.locator(".product-card, .set-card").all();
console.log("card count:", cards.length);

// screenshot each product-card's media individually so we can eyeball crops
const mediaEls = await page.locator(".product-card .media").all();
let i = 0;
for (const media of mediaEls) {
  await media.screenshot({ path: `.verify/card-media-${i}.png` });
  i++;
}

console.log("errors:", errors.length ? errors : "none");
await browser.close();
