import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });

await page.goto("http://localhost:4322/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const story = page.locator(".story");
await story.screenshot({ path: ".verify/story-rows.png" });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
