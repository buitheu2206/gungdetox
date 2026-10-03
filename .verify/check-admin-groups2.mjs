import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1200 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto("http://localhost:4321/admin/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
console.log("url after goto:", page.url());
await page.evaluate(() => {
  document.getElementById("admin-login-form")?.setAttribute("hidden", "");
  document.getElementById("admin-content")?.removeAttribute("hidden");
});
await page.waitForTimeout(1000);
console.log("errors:", errors);
console.log("table exists:", await page.locator("#products-table").count());
console.log("rows count:", await page.locator("#products-body tr").count());
await page.screenshot({ path: ".verify/admin-groups2.png", fullPage: true });
await browser.close();
