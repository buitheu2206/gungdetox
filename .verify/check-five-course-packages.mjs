// Verify the five course cards and the formula package's shared detail page.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.COURSE_CHECK_URL ?? "http://localhost:4321";
const browser = await chromium.launch();

async function assertCardLayout(page) {
  const rows = await page.locator(".package-card").evaluateAll((cards) => {
    const selectors = ["h3", ".package-price", ".package-tagline", ".package-detail-link", ".package-cta"];
    return cards.map((card) => {
      const bounds = card.getBoundingClientRect();
      return {
        top: bounds.top,
        overflow: card.scrollWidth > card.clientWidth,
        sections: selectors.map((selector) => {
          const element = card.querySelector(selector);
          const section = element.getBoundingClientRect();
          return { top: section.top, height: section.height, inside: section.left >= bounds.left && section.right <= bounds.right };
        }),
      };
    });
  });
  for (const row of rows) {
    assert.ok(!row.overflow, "Course content must fit inside its card");
    assert.ok(row.sections.every((section) => section.inside), "Course sections must stay inside the card");
    const sibling = rows.find((other) => other !== row && Math.abs(other.top - row.top) < 1);
    if (!sibling) continue;
    row.sections.forEach((section, index) => {
      assert.ok(Math.abs(section.top - sibling.sections[index].top) < 1, "Course sections must align across a row");
    });
    assert.ok(Math.abs(row.sections.at(-1).height - sibling.sections.at(-1).height) < 1, "Registration buttons must have equal heights");
  }
}

try {
  const page = await browser.newPage();
  for (const width of [1440, 1101, 1024, 901, 768, 541, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${baseUrl}/khoa-hoc`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".package-card").count(), 5);
    const firstCard = page.locator(".package-card").first();
    assert.match(await firstCard.innerText(), /Gói 1 — Công thức/);
    assert.match(await firstCard.innerText(), /5\.000\.000đ\s+\/ dòng/);
    assert.equal(await firstCard.locator(".package-detail-link").getAttribute("href"), "/khoa-hoc/cong-thuc");
    await firstCard.scrollIntoViewIfNeeded();
    assert.ok(await firstCard.locator("img").evaluate((img) => img.complete && img.naturalWidth > 0));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await assertCardLayout(page);
    if (width === 1440) {
      await page.locator(".package-grid").screenshot({ path: ".verify/five-course-packages.png" });
    }
  }

  await page.locator(".package-card").first().locator(".package-detail-link").click();
  await page.waitForURL(`${baseUrl}/khoa-hoc/cong-thuc`);
  for (const text of ["Gói 1 — Công thức", "5.000.000đ / dòng", "Tự học – tự làm – tự triển khai",
    "Công thức, định lượng, tài liệu, giải đáp", "File Google gồm 10 Sheet hướng dẫn",
    "Thời gian hoàn thiện: 2 ngày. Thanh toán trước khi nhận file."]) {
    assert.ok((await page.locator("main").innerText()).includes(text), `Missing detail: ${text}`);
  }
  assert.ok(await page.locator(".detail-media img").evaluate((img) => img.complete && img.naturalWidth > 0));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.equal(await page.locator(".package-cta").getAttribute("href"), "https://forms.gle/hLtzhyzPiQtnxnbe6");
  for (const slug of ["khoi-dong-online", "hoc-thuc-te", "hoc-marketing", "full-dong-hanh"]) {
    const response = await page.goto(`${baseUrl}/khoa-hoc/${slug}`);
    assert.equal(response.status(), 200, `Existing detail route: ${slug}`);
  }
  console.log("PASS: five cards, formula details, images, registration link, responsive layout and existing routes.");
} finally {
  await browser.close();
}
