import { chromium, devices } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone 13"] });
const page = await context.newPage();

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

const pages = [
  ["/", "#featured-grid .product-card", "mobile-home"],
  ["/san-pham", ".product-card", "mobile-san-pham"],
  ["/dat-hang", "#product-select", "mobile-dat-hang"],
  ["/quy-trinh", "h1", "mobile-quy-trinh"],
  ["/lien-he", ".location-card", "mobile-lien-he"],
];

for (const [path, waitSel, shot] of pages) {
  await page.goto(`http://localhost:4322${path}`, { waitUntil: "networkidle" });
  await page.waitForSelector(waitSel, { timeout: 10000 });
  await page.screenshot({ path: `.verify/${shot}.png`, fullPage: true });
  console.log(`${path}: OK`);
}

console.log("Console errors:", errors.length ? errors : "none");
await browser.close();
