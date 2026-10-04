import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 900 });
await page.goto("http://localhost:4321/admin/blog", { waitUntil: "networkidle" });
await page.evaluate(() => {
  document.getElementById("admin-content").hidden = false;
  document.getElementById("admin-login-form").hidden = true;
});
await page.waitForSelector("#posts-body tr");
// click edit on the kombucha post (well-formatted legacy plain-text post)
const rows = await page.locator("#posts-body tr").all();
let clicked = false;
for (const row of rows) {
  const text = await row.innerText();
  if (text.includes("Kombucha")) {
    await row.locator(".edit-btn").click();
    clicked = true;
    break;
  }
}
console.log("clicked edit:", clicked);
await page.waitForTimeout(300);
await page.screenshot({ path: ".verify/quill-edit-legacy.png" });
const html = await page.evaluate(() => document.querySelector("#f-body-editor .ql-editor").innerHTML);
console.log("Quill loaded legacy post as:\n", html.slice(0, 500));
await browser.close();
