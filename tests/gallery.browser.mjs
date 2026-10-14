// Run on the local Astro dev origin: (await import('/tests/gallery.browser.mjs')).runGalleryTests()
// Detached fixtures and fake image data; no Supabase calls or account required.
import { initGalleryPreview } from "../src/lib/gallery-preview.ts";
import { initMainImagePreview } from "../src/lib/image-preview.ts";
import { initDetailGallery } from "../src/lib/detail-gallery.ts";
import { getAstroScopeHtml } from "../src/lib/astro-scope.ts";

const imageUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selectFiles(input, names) {
  const transfer = new DataTransfer();
  names.forEach((name) => transfer.items.add(new File(["image"], name, { type: "image/png" })));
  input.files = transfer.files;
  input.dispatchEvent(new Event("change"));
}

function checkEditor() {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  const preview = document.createElement("div");
  preview.setAttribute("data-astro-cid-test", "");
  const gallery = initGalleryPreview(input, preview);
  const saved = [imageUrl, `${imageUrl}#second`];
  gallery.setImages(saved);
  preview.querySelector(".remove-gallery-img").click();
  assert(gallery.getUrls().length === 1 && saved.length === 2, "Removing saved images must not mutate the source row");
  selectFiles(input, ['a"<b>.png']);
  const oldPreviewUrl = preview.querySelector(".pending img").src;
  selectFiles(input, ["second.png"]);
  assert(input.files.length === 2, "Selecting more files must append to the pending selection");
  assert(preview.querySelector(".pending-label").textContent === 'a"<b>.png', "Filename must stay literal text");
  assert(!preview.querySelector("b"), "Filename must not become markup");
  assert([...preview.querySelectorAll("*")].every((element) => element.hasAttribute("data-astro-cid-test")), "Dynamic previews must inherit scoped styles");
  preview.querySelector(".remove-pending-img").click();
  assert(input.files.length === 1 && input.files[0].name === "second.png", "Removing a pending image must update upload files");
  gallery.setImages([imageUrl]);
  assert(input.files.length === 0 && !preview.querySelector(".pending"), "Editing another row must clear pending files");
  gallery.setImages();
  assert(!preview.children.length && gallery.getUrls().length === 0, "Reset must clear saved and pending images");
  return oldPreviewUrl;
}

function checkMainImage() {
  const input = document.createElement("input");
  input.type = "file";
  const preview = document.createElement("div");
  preview.setAttribute("data-astro-cid-test", "");
  const remove = document.createElement("button");
  remove.id = "remove-main-image";
  preview.append(remove);
  let savedUrl = imageUrl;
  const render = initMainImagePreview(input, preview, document.createElement("div"), {
    getUrl: () => savedUrl,
    clearUrl: () => { savedUrl = null; },
  });
  render();
  assert(preview.querySelector("img").hasAttribute("data-astro-cid-test"), "Cover preview must inherit scoped styles");
  selectFiles(input, ["replacement.png"]);
  assert(preview.querySelector("img").src.startsWith("blob:"), "Selected cover must show a local preview");
  remove.click();
  assert(preview.querySelector("img").src === imageUrl && !input.files.length, "Removing a replacement must restore the saved cover");
  remove.click();
  assert(preview.hidden && savedUrl === null, "Removing a saved cover must clear it");
}

function checkDetailGallery() {
  const gallery = document.createElement("div");
  gallery.setAttribute("data-astro-cid-test", "");
  const cover = document.createElement("img");
  cover.id = "test-detail-cover";
  gallery.append(cover);
  document.body.append(gallery);
  try {
    const render = initDetailGallery(gallery, cover.id);
    render([imageUrl]);
    assert(!gallery.querySelector("#gallery-thumbs"), "A single image needs no thumbnail strip");
    render([imageUrl, `${imageUrl}#second`]);
    const thumbs = gallery.querySelectorAll(".thumb");
    thumbs[1].querySelector("img").click();
    assert(cover.src.endsWith("#second") && thumbs[1].classList.contains("active") && !thumbs[0].classList.contains("active"), "Clicking a new thumbnail must switch the image and active state");
    assert([...gallery.querySelectorAll("#gallery-thumbs, .thumb, .thumb img")].every((element) => element.hasAttribute("data-astro-cid-test")), "Detail thumbnails must inherit scoped styles");
    render([]);
    assert(!gallery.querySelector("#gallery-thumbs"), "Empty gallery must remove old thumbnails");
    render([imageUrl, `${imageUrl}#third`]);
    gallery.querySelectorAll(".thumb")[1].click();
    assert(cover.src.endsWith("#third"), "Selection must work after removing and recreating thumbnails");
  } finally {
    gallery.remove();
  }
}

export function runGalleryTests() {
  const revoked = [];
  const originalRevoke = URL.revokeObjectURL;
  URL.revokeObjectURL = (url) => { revoked.push(url); originalRevoke.call(URL, url); };
  try {
    const oldUrl = checkEditor();
    assert(revoked.includes(oldUrl), "Replaced preview URLs must be released");
    checkMainImage();
    checkDetailGallery();
    assert(getAstroScopeHtml(document.createElement("div")) === "", "Unscoped elements need no scope attribute");
    initDetailGallery(null, "missing")([]);
    return "PASS: main image replacement/removal, editor selection/removal/reset, literal filenames, scope, URL cleanup, detail refresh/selection";
  } finally {
    URL.revokeObjectURL = originalRevoke;
  }
}
