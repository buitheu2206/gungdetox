import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:4321/dat-hang");
await page.selectOption("#product-select", { index: 1 });
await page.click("text=+ Thêm vào giỏ hàng");
await page.click("#step1-next");
await page.waitForSelector('section[data-step="2"]:not([hidden])');
await page.click('.slot-option:has-text("Chiều")');

const result = await page.evaluate(() => {
  const el = [...document.querySelectorAll(".slot-option")].find(o => o.textContent.includes("Chiều"));
  const attr = [...el.attributes].map(a => a.name + "=" + a.value);
  return {
    attrs: attr,
    matchesHas: el.matches(".slot-option:has(input:checked)"),
    matchesWithAttr: el.matches(`.slot-option${attr.find(a=>a.startsWith('data-astro-cid'))?.split('=')[0] ? '['+attr.find(a=>a.startsWith('data-astro-cid')).split('=')[0]+']' : ''}:has(input:checked)`),
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
