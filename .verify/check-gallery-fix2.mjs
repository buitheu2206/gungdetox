import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto("http://localhost:4321/san-pham/ginger-shot", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
console.log("errors:", errors);
const info = await page.evaluate(() => {
  const gallery = document.querySelector(".gallery");
  const main = document.querySelector(".gallery-main");
  const thumbs = document.getElementById("gallery-thumbs");
  const grid = document.querySelector(".detail-grid");
  return {
    galleryClass: gallery?.className,
    mainRect: main?.getBoundingClientRect(),
    thumbsHTML: thumbs?.outerHTML?.slice(0, 200),
    gridRect: grid?.getBoundingClientRect(),
    gridCols: grid ? getComputedStyle(grid).gridTemplateColumns : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: ".verify/gallery-fix-full.png", fullPage: true });
await browser.close();
