import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://localhost:4321/blog/kombucha-loi-khuan-tu-dau", { waitUntil: "networkidle" });
const h = await page.evaluate(() => document.querySelector(".site-header")?.getBoundingClientRect().height);
console.log("header height:", h);
await browser.close();
