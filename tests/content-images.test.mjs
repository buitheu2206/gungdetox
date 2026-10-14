import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import { uploadContentImages } from "../src/lib/content-images.ts";

function createStorageClient(failAt = 0) {
  const requests = [];
  const client = createClient("https://test.supabase.co", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (url) => {
        requests.push(new URL(url));
        const failed = requests.length === failAt;
        return new Response(JSON.stringify(failed
          ? { message: "Permission denied", statusCode: "403" }
          : { Key: "uploaded" }), {
          status: failed ? 403 : 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  });
  return { client, requests };
}

const file = (name) => new File(["image"], name, { type: "image/png" });

for (const [table, bucket] of [["products", "product-images"], ["posts", "post-images"]]) {
  test(`should upload the cover and gallery of ${table} to its own bucket in order`, async () => {
    const { client, requests } = createStorageClient();
    const galleryUrls = ["https://example.com/saved.png"];
    const cover = await uploadContentImages(client, table, {
      currentUrl: null, mainFile: file("cover.png"),
      galleryFiles: [file("one.png"), file("two.png")], galleryUrls,
    });
    assert.match(cover, new RegExp(`/public/${bucket}/\\d+-cover.png$`));
    assert.deepEqual(requests.map((url) => url.pathname.replace(/\d+-/g, "")), [
      `/storage/v1/object/${bucket}/cover.png`,
      `/storage/v1/object/${bucket}/one.png`,
      `/storage/v1/object/${bucket}/two.png`,
    ]);
    assert.equal(galleryUrls[0], "https://example.com/saved.png");
    assert.match(galleryUrls[1], /-one.png$/);
    assert.match(galleryUrls[2], /-two.png$/);
  });
}

test("should retain the saved cover without making requests when no files are selected", async () => {
  const { client, requests } = createStorageClient();
  const galleryUrls = ["saved-gallery"];
  assert.equal(await uploadContentImages(client, "products", {
    currentUrl: "saved-cover", galleryFiles: [], galleryUrls,
  }), "saved-cover");
  assert.deepEqual(galleryUrls, ["saved-gallery"]);
  assert.equal(requests.length, 0);
});

test("should stop before uploading gallery files when the cover upload fails", async () => {
  const { client, requests } = createStorageClient(1);
  const galleryUrls = [];
  await assert.rejects(uploadContentImages(client, "posts", {
    currentUrl: null, mainFile: file("cover.png"), galleryFiles: [file("one.png")], galleryUrls,
  }), /Lỗi tải ảnh: Permission denied/);
  assert.equal(requests.length, 1);
  assert.deepEqual(galleryUrls, []);
});

test("should report gallery upload failure and preserve only successful uploads", async () => {
  const { client, requests } = createStorageClient(2);
  const galleryUrls = ["saved"];
  await assert.rejects(uploadContentImages(client, "products", {
    currentUrl: null, galleryFiles: [file("one.png"), file("two.png"), file("three.png")], galleryUrls,
  }), /Lỗi tải ảnh phụ: Permission denied/);
  assert.equal(requests.length, 2);
  assert.equal(galleryUrls.length, 2);
  assert.match(galleryUrls[1], /-one.png$/);
});
