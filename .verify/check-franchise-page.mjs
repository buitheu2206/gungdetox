import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });

await page.goto("http://localhost:4322/nhuong-quyen", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.screenshot({ path: ".verify/franchise-desktop.png", fullPage: true });

// Also click the nav link from the homepage to confirm it's wired correctly
await page.goto("http://localhost:4322/", { waitUntil: "networkidle" });
const link = page.locator('a:text("Nhượng quyền")').first();
await link.click();
await page.waitForLoadState("networkidle");
console.log("Nav link navigated to:", page.url());

console.log("errors:", errors.length ? errors : "none");
await browser.close();
