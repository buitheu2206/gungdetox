import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:4321/dat-hang");
await page.selectOption("#product-select", { index: 1 });
await page.click("text=+ Thêm vào giỏ hàng");
await page.click("#step1-next");
await page.waitForSelector('section[data-step="2"]:not([hidden])');
await page.click('.slot-option:has-text("Chiều")');
await page.waitForTimeout(100);

const result = await page.evaluate(() => {
  const els = [...document.querySelectorAll(".slot-option")];
  return els.map(el => ({
    text: el.textContent.trim().slice(0, 20),
    checked: el.querySelector("input").checked,
    matchesHas: el.matches(".slot-option:has(input:checked)"),
    borderColor: getComputedStyle(el).borderColor,
  }));
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
