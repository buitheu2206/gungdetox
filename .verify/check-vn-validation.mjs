import { chromium } from "playwright";
const browser = await chromium.launch();
const context = await browser.newContext({ locale: "en-US", viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

await page.selectOption("#product-select", { index: 1 });
await page.click("#add-to-cart");
await page.click("#step1-next"); // -> step 2
await page.fill("#delivery-date", "2026-09-20");
await page.click("[data-next='3']", { timeout: 5000 }); // -> step 3

const step = await page.evaluate(() => document.querySelector(".step:not([hidden])")?.getAttribute("data-step"));
console.log("current step after clicking through:", step);

// try to go to step 4 without filling name/phone/address
await page.click("[data-next='4']", { timeout: 5000 }).catch((e) => console.log("click step4 failed:", e.message));
await page.waitForTimeout(200);

const phoneMsg = await page.evaluate(() => document.getElementById("phone")?.validationMessage);
const nameMsg = await page.evaluate(() => document.getElementById("customer-name")?.validationMessage);
console.log("name validationMessage:", nameMsg);
console.log("phone validationMessage:", phoneMsg);

// Now fill name, retry -> should surface phone's Vietnamese message next
await page.fill("#customer-name", "Nguyễn Văn A");
await page.click("[data-next='4']", { timeout: 5000 }).catch((e) => console.log("click step4 (2nd) failed:", e.message));
await page.waitForTimeout(200);
const phoneMsg2 = await page.evaluate(() => document.getElementById("phone")?.validationMessage);
console.log("phone validationMessage (after name filled):", phoneMsg2);

await page.fill("#phone", "123");
await page.click("[data-next='4']", { timeout: 5000 }).catch(() => {});
await page.waitForTimeout(200);
const phonePatternMsg = await page.evaluate(() => document.getElementById("phone")?.validationMessage);
console.log("phone validationMessage (invalid format '123'):", phonePatternMsg);

await browser.close();
