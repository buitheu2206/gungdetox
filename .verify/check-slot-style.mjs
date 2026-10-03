import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.selectOption("#product-select", { index: 1 });
await page.click("text=+ Thêm vào giỏ hàng");
await page.click("#step1-next");
await page.waitForSelector('section[data-step="2"]:not([hidden])');
await page.click('.slot-option:has-text("Chiều")');

const style = await page.evaluate(() => {
  const el = [...document.querySelectorAll(".slot-option")].find(o => o.textContent.includes("Chiều"));
  const cs = getComputedStyle(el);
  return { border: cs.borderColor, background: cs.backgroundColor, boxShadow: cs.boxShadow };
});
console.log(style);
await browser.close();
