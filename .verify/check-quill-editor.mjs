import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 900 });
await page.goto("http://localhost:4321/admin/blog", { waitUntil: "networkidle" });

// Confirm Quill script loaded globally
const hasQuill = await page.evaluate(() => typeof window.Quill !== "undefined");
console.log("window.Quill loaded:", hasQuill);

// Reveal the admin-content (normally hidden behind login) just so we can
// screenshot/interact for testing the editor itself — bypasses auth only
// for this local test, doesn't touch real login logic.
await page.evaluate(() => {
  document.getElementById("admin-content").hidden = false;
  document.getElementById("admin-login-form").hidden = true;
});
await page.waitForTimeout(200);
await page.screenshot({ path: ".verify/quill-editor-empty.png" });

// Confirm toolbar + editor rendered
const hasToolbar = await page.locator(".ql-toolbar").count();
const hasEditor = await page.locator(".ql-editor").count();
console.log("toolbar count:", hasToolbar, "| editor count:", hasEditor);

// Type some text, select it, apply bold + bullet list via Quill API directly
await page.evaluate(() => {
  const quill = document.querySelector("#f-body-editor").__quill || null;
});

// Click into editor and type manually (real user-like interaction)
await page.click(".ql-editor");
await page.keyboard.type("Dòng in đậm");
await page.keyboard.press("Control+A");
await page.click('.ql-toolbar .ql-bold');
await page.keyboard.press("End");
await page.keyboard.press("Enter");
await page.keyboard.type("Mục 1");
await page.click('.ql-toolbar .ql-list[value="bullet"]');
await page.keyboard.press("Enter");
await page.keyboard.type("Mục 2");

await page.waitForTimeout(200);
await page.screenshot({ path: ".verify/quill-editor-filled.png" });

const html = await page.evaluate(() => document.querySelector("#f-body-editor .ql-editor").innerHTML);
console.log("resulting HTML:\n", html);

await browser.close();
