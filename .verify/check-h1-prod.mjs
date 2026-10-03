import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("https://gungdetox.com/", { waitUntil: "networkidle" });
const count = await page.locator("h1").count();
console.log("prod h1 count:", count);
await browser.close();
