import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:4321/dat-hang");
const supports = await page.evaluate(() => CSS.supports("selector(:has(a))"));
const version = await browser.version();
console.log("has support:", supports, "browser:", version);

// check if input is actually checked
await page.selectOption("#product-select", { index: 1 });
await page.click("text=+ Thêm vào giỏ hàng");
await page.click("#step1-next");
await page.waitForSelector('section[data-step="2"]:not([hidden])');
await page.click('.slot-option:has-text("Chiều")');
const checkedInfo = await page.evaluate(() => {
  const radios = [...document.querySelectorAll('input[name="delivery-slot"]')];
  return radios.map(r => ({ value: r.value, checked: r.checked }));
});
console.log(checkedInfo);
await browser.close();
