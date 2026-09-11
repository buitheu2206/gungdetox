import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });

const targets = [
  ["/san-pham", "list-san-pham"],
  ["/san-pham/coco-matcha", "detail-coco-matcha"],
  ["/san-pham/sua-hat-tuoi", "detail-sua-hat-tuoi"],
  ["/san-pham/set-5-mix-can-bang", "detail-set-5"],
  ["/san-pham/combo-thang-ginger-shot", "detail-combo-thang"],
  ["/blog", "list-blog"],
  ["/blog/uong-nuoc-ep-cu-den-dung-cach", "detail-blog-cu-den"],
];

for (const [path, name] of targets) {
  await page.goto("http://localhost:4322" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `.verify/${name}.png`, fullPage: true });
  console.log("captured", path);
}

console.log("errors:", errors.length ? errors : "none");
await browser.close();
