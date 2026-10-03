import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1200 } });
await page.goto("http://localhost:4321/admin/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(() => {
  document.getElementById("admin-login-form")?.setAttribute("hidden", "");
  document.getElementById("admin-content")?.removeAttribute("hidden");
});
await page.waitForTimeout(800);
await page.locator("#products-table").scrollIntoViewIfNeeded();
await page.screenshot({ path: ".verify/admin-groups.png" });
await browser.close();
