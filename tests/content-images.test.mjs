import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import { uploadContentImages } from "../src/lib/content-images.ts";

function createStorageClient(failAt = 0, acceptFailedUpload = false) {
  const requests = [];
  const savedPaths = new Set();
  const client = createClient("https://test.supabase.co", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (url, init) => {
        const path = new URL(url).pathname;
        if (init.method === "GET") {
          const exists = savedPaths.has(path.replace("/object/info/", "/object/"));
          return new Response(JSON.stringify(exists ? { name: "saved" } : { message: "Not found", statusCode: "404" }), {
            status: exists ? 200 : 404, headers: { "Content-Type": "application/json" },
          });
        }
        requests.push(new URL(url));
        const failed = requests.length === failAt;
        if (!failed || acceptFailedUpload) savedPaths.add(path);
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
    const result = await uploadContentImages(client, table, {
      uploadedFiles: new Map(), currentUrl: null, mainFile: file("cover.png"),
      galleryFiles: [file("one.png"), file("two.png")], galleryUrls,
    });
    assert.match(result.imageUrl, new RegExp(`/public/${bucket}/[a-f0-9-]+-cover.png$`));
    assert.deepEqual(requests.map((url) => url.pathname.replace(/[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}-/g, "")), [
      `/storage/v1/object/${bucket}/cover.png`,
      `/storage/v1/object/${bucket}/one.png`,
      `/storage/v1/object/${bucket}/two.png`,
    ]);
    assert.equal(galleryUrls[0], "https://example.com/saved.png");
    assert.match(result.galleryUrls[1], /-one.png$/);
    assert.match(result.galleryUrls[2], /-two.png$/);
  });
}

test("should retain the saved cover without making requests when no files are selected", async () => {
  const { client, requests } = createStorageClient();
  const galleryUrls = ["saved-gallery"];
  assert.deepEqual(await uploadContentImages(client, "products", {
    uploadedFiles: new Map(), currentUrl: "saved-cover", galleryFiles: [], galleryUrls,
  }), { imageUrl: "saved-cover", galleryUrls: ["saved-gallery"] });
  assert.deepEqual(galleryUrls, ["saved-gallery"]);
  assert.equal(requests.length, 0);
});

test("should stop before uploading gallery files when the cover upload fails", async () => {
  const { client, requests } = createStorageClient(1);
  const galleryUrls = [];
  await assert.rejects(uploadContentImages(client, "posts", {
    uploadedFiles: new Map(), currentUrl: null, mainFile: file("cover.png"), galleryFiles: [file("one.png")], galleryUrls,
  }), /Lỗi tải ảnh: Permission denied/);
  assert.equal(requests.length, 1);
  assert.deepEqual(galleryUrls, []);
});

test("should report gallery upload failure without committing a partial gallery", async () => {
  const { client, requests } = createStorageClient(2);
  const galleryUrls = ["saved"];
  await assert.rejects(uploadContentImages(client, "products", {
    uploadedFiles: new Map(), currentUrl: null, galleryFiles: [file("one.png"), file("two.png"), file("three.png")], galleryUrls,
  }), /Lỗi tải ảnh phụ: Permission denied/);
  assert.equal(requests.length, 2);
  assert.deepEqual(galleryUrls, ["saved"]);
});

test("should reuse successful cover/gallery uploads when retrying after partial failure or a database error", async () => {
  const { client, requests } = createStorageClient(3);
  const images = {
    currentUrl: null, mainFile: file("cover.png"), galleryFiles: [file("one.png"), file("two.png")],
    galleryUrls: ["saved"], uploadedFiles: new Map(),
  };
  await assert.rejects(uploadContentImages(client, "products", images), /Lỗi tải ảnh phụ/);
  assert.deepEqual(images.galleryUrls, ["saved"]);
  assert.equal(images.uploadedFiles.size, 2);
  const result = await uploadContentImages(client, "products", images);
  assert.equal(requests.length, 4);
  assert.equal(result.galleryUrls.length, 3);
  assert.deepEqual(await uploadContentImages(client, "products", images), result);
  assert.equal(requests.length, 4);
  assert.equal(result.galleryUrls.length, 3);
  images.galleryFiles = [images.galleryFiles[1]];
  const afterRemoval = await uploadContentImages(client, "products", images);
  assert.equal(afterRemoval.galleryUrls.length, 2);
});


test("should recognize a file accepted by storage when its upload response is lost", async () => {
  const { client, requests } = createStorageClient(1, true);
  const images = { currentUrl: null, mainFile: file("cover.png"), galleryFiles: [], galleryUrls: [], uploadedFiles: new Map() };
  const result = await uploadContentImages(client, "products", images);
  assert.match(result.imageUrl, /-cover.png$/);
  assert.deepEqual(await uploadContentImages(client, "products", images), result);
  assert.equal(requests.length, 1);
});
