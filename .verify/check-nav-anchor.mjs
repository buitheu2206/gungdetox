import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://localhost:4322/san-pham", { waitUntil: "domcontentloaded" });
await page.click('a[href="/#cau-chuyen"]');
await page.waitForURL("**/#cau-chuyen");
await page.waitForTimeout(300);
console.log("URL after clicking Giới thiệu:", page.url());
const storyVisible = await page.$eval("#cau-chuyen", (el) => {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
});
console.log("Story section in viewport after nav click:", storyVisible);

// test old /quy-trinh redirect via real browser navigation
await page.goto("http://localhost:4322/quy-trinh", { waitUntil: "load" });
await page.waitForTimeout(300);
console.log("Final URL after visiting /quy-trinh:", page.url());

console.log("errors:", errors.length ? errors : "none");
await browser.close();
