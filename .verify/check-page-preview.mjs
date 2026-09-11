import { chromium } from "playwright";

const [, , path, waitSelector, shotName] = process.argv;
const url = `http://localhost:4322${path}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push("pageerror: " + err.message));

await page.goto(url, { waitUntil: "networkidle" });
if (waitSelector) {
  await page.waitForSelector(waitSelector, { timeout: 10000 });
}
await page.screenshot({ path: `.verify/${shotName}.png`, fullPage: true });

console.log("Console errors:", errors.length ? errors : "none");
await browser.close();
