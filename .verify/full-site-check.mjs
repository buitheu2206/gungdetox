import { chromium } from "playwright";

const pages = [
  "/", "/san-pham", "/dat-hang", "/lien-he", "/blog",
  "/san-pham/ginger-shot", "/san-pham/kombucha", "/san-pham/set-1-xanh-thanh-loc",
  "/san-pham/combo-thang-ginger-shot",
  "/blog/kombucha-loi-khuan-tu-dau",
  "/chinh-sach/doi-tra-chai", "/chinh-sach/giao-hang", "/chinh-sach/thanh-toan",
];

const browser = await chromium.launch();

for (const path of pages) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  const brokenRequests = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) brokenRequests.push(`${r.status()} ${r.url()}`);
  });
  try {
    await page.goto(`http://localhost:4322${path}`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(400);
  } catch (e) {
    errors.push("goto failed: " + e.message);
  }

  // check images with no alt or broken (naturalWidth 0)
  const imgIssues = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs
      .filter((img) => img.naturalWidth === 0 || !img.getAttribute("alt"))
      .map((img) => ({ src: img.getAttribute("src"), alt: img.getAttribute("alt"), broken: img.naturalWidth === 0 }));
  });

  const title = await page.title();
  const h1Count = await page.locator("h1").count();

  console.log(`\n=== ${path} ===`);
  console.log("title:", title);
  console.log("h1 count:", h1Count);
  if (errors.length) console.log("console/page errors:", errors);
  if (brokenRequests.length) console.log("broken requests:", brokenRequests);
  if (imgIssues.length) console.log("image issues:", imgIssues);

  await page.close();
}

await browser.close();
