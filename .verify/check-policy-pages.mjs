import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });

// Click the real footer links from the homepage, like a visitor would
await page.goto("http://localhost:4322/", { waitUntil: "networkidle" });

for (const linkText of ["Đổi trả chai refill", "Giao hàng theo tuần", "Thanh toán"]) {
  await page.goto("http://localhost:4322/", { waitUntil: "networkidle" });
  const link = page.locator(`footer a:text("${linkText}")`);
  const href = await link.getAttribute("href");
  await link.click();
  await page.waitForLoadState("networkidle");
  const h1 = await page.locator("h1").first().textContent();
  console.log(`"${linkText}" -> ${href} -> loaded, url=${page.url()}, h1="${h1}"`);
  const name = linkText === "Đổi trả chai refill" ? "policy-doi-tra" : linkText === "Giao hàng theo tuần" ? "policy-giao-hang" : "policy-thanh-toan";
  await page.screenshot({ path: `.verify/${name}.png`, fullPage: true });
}

console.log("errors:", errors.length ? errors : "none");
await browser.close();
