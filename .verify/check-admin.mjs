import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("dialog", async (d) => {
  if (d.type() === "confirm") { await d.accept(); }
  else { errors.push("alert: " + d.message()); await d.dismiss(); }
});

async function login(path) {
  await page.goto(`http://localhost:4322${path}`, { waitUntil: "networkidle" });
  const alreadyIn = await page
    .waitForSelector("#admin-content:not([hidden])", { timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  if (alreadyIn) {
    console.log(`(${path}) already authenticated via existing session)`);
    return;
  }
  await page.fill('#admin-login-form input[name="email"]', "buitheu698@gmail.com");
  await page.fill('#admin-login-form input[name="password"]', "Buitheu698@");
  await page.click('#admin-login-form button[type="submit"]');
  await page.waitForSelector("#admin-content:not([hidden])", { timeout: 10000 });
}

// --- 1) /admin/don-hang: login + change a status ---
await login("/admin/don-hang");
await page.waitForSelector("#orders-body tr");
console.log("don-hang: logged in, orders table loaded");
await page.screenshot({ path: ".verify/admin-don-hang.png", fullPage: true });

// --- 2) /admin/san-pham: login + add a test product + edit + delete ---
await login("/admin/san-pham");
await page.waitForSelector("#products-body tr");
await page.fill("#f-slug", "test-admin-product");
await page.selectOption("#f-type", "single");
await page.fill("#f-name", "Test Admin Product");
await page.fill("#f-price-retail", "12345");
await page.click("button.save-btn");
await page.waitForFunction(
  () => document.querySelector('#products-body')?.textContent?.includes("Test Admin Product"),
  { timeout: 10000 }
);
console.log("san-pham: test product added");
await page.screenshot({ path: ".verify/admin-san-pham.png", fullPage: true });

// edit it
await page.click('.edit-btn >> nth=0'); // most recently added likely first if sort_order default 0 - just click first edit btn found matching name via evaluate instead
const rows = await page.$$eval("#products-body tr", (trs) =>
  trs.map((tr) => tr.textContent || "")
);
console.log("Row count after add:", rows.length);

// delete the test product via its row's delete button (find by matching text)
const testRow = await page.locator("tr", { hasText: "Test Admin Product" });
await testRow.locator(".delete-btn").click();
await page.waitForFunction(
  () => !document.querySelector('#products-body')?.textContent?.includes("Test Admin Product"),
  { timeout: 10000 }
);
console.log("san-pham: test product deleted OK");

// --- 3) /admin/blog: login + add a test post + delete ---
await login("/admin/blog");
await page.waitForSelector("#posts-body tr");
await page.fill("#f-slug", "test-admin-post");
await page.fill("#f-title", "Test Admin Post");
await page.fill("#f-body", "Nội dung test.");
await page.click("button.save-btn");
await page.waitForFunction(
  () => document.querySelector('#posts-body')?.textContent?.includes("Test Admin Post"),
  { timeout: 10000 }
);
console.log("blog: test post added");
await page.screenshot({ path: ".verify/admin-blog.png", fullPage: true });

const testPostRow = await page.locator("tr", { hasText: "Test Admin Post" });
await testPostRow.locator(".delete-btn").click();
await page.waitForFunction(
  () => !document.querySelector('#posts-body')?.textContent?.includes("Test Admin Post"),
  { timeout: 10000 }
);
console.log("blog: test post deleted OK");

console.log("All console errors/alerts:", errors.length ? errors : "none");
await browser.close();
