import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 900 });
await page.goto("http://localhost:4321/admin/blog", { waitUntil: "networkidle" });
await page.evaluate(() => {
  document.getElementById("admin-content").hidden = false;
  document.getElementById("admin-login-form").hidden = true;
});
await page.waitForTimeout(150);
await page.screenshot({ path: ".verify/quill-final.png" });
await browser.close();
