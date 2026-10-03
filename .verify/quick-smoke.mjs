import { chromium } from "playwright";
const browser = await chromium.launch();
const pages = ["/", "/san-pham", "/dat-hang", "/blog", "/lien-he"];
for (const p of pages) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  console.log(p, "errors:", errors.length ? errors : "none");
  await page.close();
}
await browser.close();
