import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 700 });
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.screenshot({ path: ".verify/header-with-lookup.png" });

await page.click("#lookup-trigger");
await page.waitForTimeout(200);
await page.screenshot({ path: ".verify/lookup-modal-open.png" });

// test lookup functionality
await page.fill('#lookup-form input[name="phone"]', "0912345678");
await page.click('#lookup-form button[type="submit"]');
await page.waitForTimeout(500);
await page.screenshot({ path: ".verify/lookup-modal-result.png" });

// close via close button
await page.click(".lookup-overlay-close");
await page.waitForTimeout(200);
const hiddenAfterClose = await page.getAttribute("#lookup-overlay", "hidden");
console.log("Overlay hidden after close:", hiddenAfterClose !== null);

// check dat-hang page no longer has the lookup section
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
const lookupOnPage = await page.locator("#order-lookup").count();
console.log("OrderLookup sections remaining on /dat-hang:", lookupOnPage);

await browser.close();
