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
  const out = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule.selectorText && rule.style && rule.style.borderColor) {
        try {
          if (el.matches(rule.selectorText)) {
            out.push({ sel: rule.selectorText, borderColor: rule.style.borderColor, border: rule.style.border });
          }
        } catch {}
      }
    }
  }
  return out;
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
