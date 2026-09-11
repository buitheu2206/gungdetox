import { chromium } from "playwright";

const PORT = process.argv[2] || "4322";
const BASE = `http://localhost:${PORT}`;
const TEST_PHONE = "0977123123";

const browser = await chromium.launch();
const errors = [];

async function placeOrder(page, slug) {
  await page.goto(`${BASE}/dat-hang?product=${slug}`, { waitUntil: "networkidle" });
  await page.waitForSelector("#product-select");
  await page.click('[data-next="2"]');
  await page.waitForSelector('[data-step="2"]:not([hidden])');
  await page.click('[data-next="3"]');
  await page.waitForSelector('[data-step="3"]:not([hidden])');
  await page.fill("#customer-name", "Test Classification");
  await page.fill("#phone", TEST_PHONE);
  await page.fill("#address", "123 Test St");
  await page.click('[data-next="4"]');
  await page.waitForSelector('[data-step="4"]:not([hidden])');
  await page.click('button[type="submit"]');
  await page.waitForSelector("#thank-you:not([hidden])");
  const code = await page.locator("#order-id").textContent();
  return code;
}

const page1 = await browser.newPage();
page1.on("console", (m) => { if (m.type() === "error") errors.push("order1: " + m.text()); });
const code1 = await placeOrder(page1, "ginger-shot");
console.log("Order 1 code:", code1);
await page1.close();

const page2 = await browser.newPage();
page2.on("console", (m) => { if (m.type() === "error") errors.push("order2: " + m.text()); });
const code2 = await placeOrder(page2, "kombucha");
console.log("Order 2 code:", code2);
await page2.close();

// Check order code format: should be "last4phonedigits-XXXX"
const expectedPrefix = TEST_PHONE.slice(-4);
console.log("Code1 matches phone suffix:", code1.startsWith(expectedPrefix + "-"));
console.log("Code2 matches phone suffix:", code2.startsWith(expectedPrefix + "-"));
console.log("Codes are different:", code1 !== code2);

// Check customer-facing lookup shows both orders, grouped by status
const lookupPage = await browser.newPage();
lookupPage.on("console", (m) => { if (m.type() === "error") errors.push("lookup: " + m.text()); });
await lookupPage.goto(`${BASE}/dat-hang`, { waitUntil: "networkidle" });
await lookupPage.fill('#lookup-form input[name="phone"]', TEST_PHONE);
await lookupPage.click('#lookup-form button[type="submit"]');
await lookupPage.waitForTimeout(800);
const lookupText = await lookupPage.locator("#lookup-result").innerText();
console.log("--- Lookup result text ---");
console.log(lookupText);
await lookupPage.screenshot({ path: ".verify/lookup-result.png", fullPage: false });
await lookupPage.close();

// Check admin page shows Mã đơn column + Khách mới/quen badges
const adminPage = await browser.newPage();
adminPage.on("console", (m) => { if (m.type() === "error") errors.push("admin: " + m.text()); });
await adminPage.goto(`${BASE}/admin/don-hang`, { waitUntil: "networkidle" });
await adminPage.fill('#admin-login-form input[name="email"]', "buitheu698@gmail.com");
await adminPage.fill('#admin-login-form input[name="password"]', "Buitheu698@");
await adminPage.click('#admin-login-form button[type="submit"]');
await adminPage.waitForSelector("#orders-table", { state: "visible", timeout: 10000 });
await adminPage.waitForTimeout(1000);
const rowsText = await adminPage.locator(`tr:has-text("${TEST_PHONE}")`).allInnerTexts();
console.log("--- Admin rows for test phone ---");
console.log(rowsText.join("\n---\n"));
await adminPage.screenshot({ path: ".verify/admin-classification.png", fullPage: true });

// Test the new customer-type filter chip
await adminPage.click('#customer-filter [data-customer="returning"]');
await adminPage.waitForTimeout(300);
const returningRows = await adminPage.locator(`tr:has-text("${TEST_PHONE}")`).count();
console.log("Rows shown when filtering 'Khách quen':", returningRows);
await adminPage.click('#customer-filter [data-customer="all"]');
await adminPage.close();

console.log("errors:", errors.length ? errors : "none");
await browser.close();
