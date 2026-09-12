import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push("[console] " + m.text()); });
page.on("pageerror", (e) => errors.push("[pageerror] " + String(e)));

await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.selectOption("#product-select", "ginger-shot");
await page.click("#add-to-cart");
await page.waitForTimeout(200);
await page.click("#step1-next");
await page.waitForSelector('[data-step="2"]:not([hidden])');
await page.fill("#delivery-date", "2026-09-20");
await page.click('[data-next="3"]');
await page.waitForSelector('[data-step="3"]:not([hidden])');
await page.fill("#customer-name", "Invalid Phone Test");
// Common real-world typo patterns that fail pattern="0[0-9]{9}"
await page.fill("#phone", "0988 777 666"); // spaces
await page.fill("#address", "999 Bug Test St");
await page.click('[data-next="4"]');
await page.waitForTimeout(500);

const currentStep = await page.locator(".step:not([hidden])").getAttribute("data-step");
console.log("Current visible step after clicking next with spaced phone:", currentStep);

const validity = await page.locator("#phone").evaluate((el) => ({
  valid: el.validity.valid,
  patternMismatch: el.validity.patternMismatch,
  validationMessage: el.validationMessage,
}));
console.log("Phone field validity:", validity);

await page.screenshot({ path: ".verify/submit-invalid-phone.png", fullPage: true });

// Now actually click the final submit button and see what happens
await page.click('#order-form button[type="submit"]');
await page.waitForTimeout(800);
const thankYouHidden = await page.locator("#thank-you").isHidden();
console.log("thank-you hidden after submit click with invalid phone (expected true = blocked):", thankYouHidden);
const stepAfterSubmit = await page.locator(".step:not([hidden])").getAttribute("data-step");
console.log("Step visible after submit attempt:", stepAfterSubmit);
await page.screenshot({ path: ".verify/submit-invalid-after-click.png", fullPage: true });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
