// Verify spacing, height and sharing behavior for the course hero actions.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.COURSE_CHECK_URL ?? "http://localhost:4321";
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const width of [1440, 800, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${baseUrl}/khoa-hoc`, { waitUntil: "networkidle" });
    const actions = page.locator(".franchise-hero-actions");
    const hotline = await actions.locator("a").boundingBox();
    const share = await actions.locator("button").boundingBox();
    assert.ok(share.height >= 44, "Share button must have a usable height");
    if (Math.abs(hotline.y - share.y) < 1) {
      assert.ok(share.x - hotline.x - hotline.width >= 11, "Buttons must have a gap");
      assert.ok(Math.abs(hotline.height - share.height) < 1, "Buttons must have equal heights on the same row");
    } else {
      assert.ok(share.y - hotline.y - hotline.height >= 11, "Wrapped buttons must keep a gap");
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await actions.screenshot({ path: `.verify/course-hero-actions-${width}.png` });
  }
  await page.locator(".franchise-hero-actions button").click();
  await page.locator("#share-url-input").waitFor({ state: "visible" });
  assert.equal(await page.locator("#share-url-input").inputValue(), `${baseUrl}/khoa-hoc`);
  console.log("PASS: hero actions keep spacing and height on desktop/mobile; sharing still opens.");
} finally {
  await browser.close();
}
