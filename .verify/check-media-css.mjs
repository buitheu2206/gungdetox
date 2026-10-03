import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
await page.goto("https://gungdetox.com/san-pham/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  const cards = document.querySelectorAll("#single-grid .product-card");
  return Array.from(cards).slice(0, 4).map((card) => {
    const media = card.querySelector(".media");
    const img = card.querySelector(".media img");
    const cs = getComputedStyle(media);
    return {
      name: card.querySelector("h3")?.textContent,
      mediaComputed: { height: cs.height, width: cs.width, aspectRatio: cs.aspectRatio, overflow: cs.overflow, display: cs.display, position: cs.position },
      imgSrc: img?.getAttribute("src"),
      imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight } : null,
      imgComputed: img ? { height: getComputedStyle(img).height, width: getComputedStyle(img).width, objectFit: getComputedStyle(img).objectFit } : null,
      mediaInlineStyle: media.getAttribute("style"),
      cardHtmlSnippet: media.outerHTML.slice(0, 300),
    };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
