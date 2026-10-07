import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import { deleteContentWithImages } from "../src/lib/delete-content.ts";

const projectUrl = "https://test.supabase.co";
const contentId = "00000000-0000-4000-8000-000000000001";
const imageUrl = (bucket, path) => `${projectUrl}/storage/v1/object/public/${bucket}/${path}`;

// Use the real SDK with a fake transport; these checks never touch a Supabase project.
function createTestClient(row, options = {}) {
  const requests = [];
  const client = createClient(projectUrl, "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (url, init) => {
        requests.push({ url: new URL(url), method: init.method, body: init.body });
        const isDatabase = requests.at(-1).url.pathname.startsWith("/rest/v1/");
        if (!isDatabase && options.networkError) throw new Error("Storage unavailable");
        const status = (isDatabase ? options.databaseStatus : options.storageStatus) ?? 200;
        const body = status >= 400
          ? { message: "Permission denied", code: "42501", statusCode: String(status) }
          : isDatabase ? row : [];
        return new Response(JSON.stringify(body), {
          status, headers: { "Content-Type": "application/json" },
        });
      },
    },
  });
  return { client, requests };
}

for (const [table, bucket] of [["products", "product-images"], ["posts", "post-images"]]) {
  test(`should delete ${table} and its thumbnail and gallery from ${bucket}`, async () => {
    const { client, requests } = createTestClient({
      image_url: imageUrl(bucket, "cover.webp"),
      gallery_images: [imageUrl(bucket, "folder/%E1%BA%A3nh%20ph%E1%BB%A5.webp"), imageUrl(bucket, "cover.webp")],
    });

    assert.equal(await deleteContentWithImages(client, table, contentId), null);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].method, "DELETE");
    assert.equal(requests[0].url.pathname, `/rest/v1/${table}`);
    assert.equal(requests[0].url.searchParams.get("id"), `eq.${contentId}`);
    assert.equal(requests[0].url.searchParams.get("select"), "image_url,gallery_images");
    assert.equal(requests[1].method, "DELETE");
    assert.equal(requests[1].url.pathname, `/storage/v1/object/${bucket}`);
    assert.deepEqual(JSON.parse(requests[1].body), { prefixes: ["cover.webp", "folder/ảnh phụ.webp"] });
  });
}

test("should leave static, external, foreign-project and foreign-bucket images alone", async () => {
  const { client, requests } = createTestClient({
    image_url: "/images/products/ginger-shot.webp",
    gallery_images: [
      "https://example.com/photo.webp",
      imageUrl("post-images", "post.webp"),
      imageUrl("product-images-extra", "other.webp"),
      "https://other.supabase.co/storage/v1/object/public/product-images/other.webp",
      imageUrl("product-images", "../post-images/other.webp"),
      imageUrl("product-images", "gallery.webp") + "?download=1",
    ],
  });
  assert.equal(await deleteContentWithImages(client, "products", contentId), null);
  assert.deepEqual(JSON.parse(requests[1].body), { prefixes: ["gallery.webp"] });
});

test("should skip storage requests when content has no uploaded images", async () => {
  for (const image_url of [null, "/images/blog/sample.webp"]) {
    const { client, requests } = createTestClient({ image_url, gallery_images: null });
    assert.equal(await deleteContentWithImages(client, "posts", contentId), null);
    assert.equal(requests.length, 1);
  }
});

test("should preserve storage when database deletion fails or deletes no accessible row", async () => {
  for (const databaseStatus of [403, 406]) {
    const { client, requests } = createTestClient({
      image_url: imageUrl("product-images", "cover.webp"),
    }, { databaseStatus });
    await assert.rejects(deleteContentWithImages(client, "products", contentId), /Không thể xoá products/);
    assert.equal(requests.length, 1);
  }
});

test("should report partial deletion when storage fails or an image path is malformed", async (context) => {
  const log = context.mock.method(console, "error", () => {});
  for (const options of [{ storageStatus: 403 }, { networkError: true }, { malformed: true }]) {
    const { client, requests } = createTestClient({
      image_url: imageUrl("post-images", options.malformed ? "%ZZ.webp" : "cover.webp"),
    }, options);
    const warning = await deleteContentWithImages(client, "posts", contentId);
    assert.match(warning, /Đã xoá nội dung nhưng chưa dọn xong ảnh trong bucket post-images/);
    assert.equal(requests[0].method, "DELETE");
    assert.equal(requests.length, options.malformed ? 1 : 2);
  }
  assert.equal(log.mock.callCount(), 3);
});

test("should reject a missing ID without sending any request", async () => {
  const { client, requests } = createTestClient({});
  await assert.rejects(deleteContentWithImages(client, "products", ""), /Thiếu ID/);
  assert.equal(requests.length, 0);
});
