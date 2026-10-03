import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const pagesToScan = ["/", "/san-pham", "/dat-hang", "/lien-he", "/blog", "/san-pham/ginger-shot", "/blog/kombucha-loi-khuan-tu-dau"];
const allLinks = new Set();

for (const p of pagesToScan) {
  await page.goto(`http://localhost:4322${p}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href]")).map((a) => a.getAttribute("href"))
  );
  hrefs.forEach((h) => allLinks.add(h));
}

const internal = [...allLinks].filter((h) => h && h.startsWith("/"));
console.log("internal links found:", internal.length);

const results = [];
for (const link of internal) {
  const res = await page.goto(`http://localhost:4322${link}`, { waitUntil: "domcontentloaded" }).catch((e) => null);
  results.push({ link, status: res ? res.status() : "FAILED" });
}
const bad = results.filter((r) => r.status === "FAILED" || r.status >= 400);
console.log("broken internal links:", JSON.stringify(bad, null, 2));
console.log("all checked:", results.length);

await browser.close();
