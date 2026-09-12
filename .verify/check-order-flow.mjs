import { chromium } from "playwright";

const PORT = process.argv[2] ?? "4322";
const url = `http://localhost:${PORT}/dat-hang?product=combo-thang-ginger-shot`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
page.on("dialog", async (dialog) => {
  errors.push("alert: " + dialog.message());
  await dialog.dismiss();
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(
  () => (document.getElementById("product-select")?.options.length ?? 0) > 0
);

const preselected = await page.$eval("#product-select", (el) => el.value);
console.log("Preselected product:", preselected);

await page.screenshot({ path: ".verify/order-step1.png" });
await page.click('[data-next="2"]');
await page.waitForSelector('.step[data-step="2"]:not([hidden])');
await page.fill("#delivery-date", "2026-09-20");
await page.screenshot({ path: ".verify/order-step2.png" });

await page.click('[data-next="3"]');
await page.waitForSelector('.step[data-step="3"]:not([hidden])');
await page.fill("#customer-name", "Nguyễn Thị Test");
await page.fill("#phone", "0912345678");
await page.fill("#address", "123 Đường Test");
await page.selectOption("#district", "Quận 3");
await page.screenshot({ path: ".verify/order-step3.png" });

await page.click('[data-next="4"]');
await page.waitForSelector('.step[data-step="4"]:not([hidden])');
const summaryText = await page.$eval("#order-summary", (el) => el.textContent);
console.log("Summary:", summaryText?.replace(/\s+/g, " ").trim());
await page.screenshot({ path: ".verify/order-step4.png" });

await page.click("button.submit");
await page.waitForSelector("#thank-you:not([hidden])", { timeout: 10000 });
const orderId = await page.$eval("#order-id", (el) => el.textContent);
console.log("Order created, id prefix:", orderId);
await page.screenshot({ path: ".verify/order-thankyou.png" });

console.log("Console errors/alerts:", errors.length ? errors : "none");
await browser.close();
