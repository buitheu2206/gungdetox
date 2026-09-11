import { chromium, devices } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices["iPhone 13"] });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:4322/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: ".verify/homepage-colorful-mobile.png", fullPage: true });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
