// Shared saved/pending gallery state for the product and blog editors.
import { getAstroScope } from "./astro-scope.ts";

function createThumbnail(
  image: { url: string; index: number; file?: File },
  scope: string | undefined,
  onRemove: () => void,
) {
  const { url, index, file } = image;
  const wrap = document.createElement("div");
  wrap.className = `gallery-thumb-wrap${file ? " pending" : ""}`;
  const thumbnail = document.createElement("img");
  thumbnail.src = url;
  const button = document.createElement("button");
  button.type = "button";
  button.className = file ? "remove-pending-img" : "remove-gallery-img";
  button.dataset.index = String(index);
  button.textContent = "×";
  button.addEventListener("click", onRemove);
  wrap.append(thumbnail);
  if (file) {
    const label = document.createElement("span");
    label.className = "pending-label";
    label.title = file.name;
    label.textContent = file.name;
    wrap.append(label);
  }
  wrap.append(button);
  if (scope) [wrap, ...wrap.children].forEach((element) => element.setAttribute(scope, ""));
  return wrap;
}

export function initGalleryPreview(input: HTMLInputElement, preview: HTMLElement) {
  const scope = getAstroScope(preview);
  let savedUrls: string[] = [];
  let pendingFiles: File[] = [];
  let previewUrls: string[] = [];

  // FileList is read-only; rebuild it after removing a pending image.
  function syncInputFiles() {
    const transfer = new DataTransfer();
    pendingFiles.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  }

  function removeImage(index: number, pending: boolean) {
    if (pending) {
      pendingFiles.splice(index, 1);
      syncInputFiles();
    } else savedUrls.splice(index, 1);
    render();
  }

  function render() {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls = pendingFiles.map((file) => URL.createObjectURL(file));
    preview.replaceChildren(
      ...savedUrls.map((url, index) => createThumbnail({ url, index }, scope, () => removeImage(index, false))),
      ...pendingFiles.map((file, index) => createThumbnail(
        { url: previewUrls[index], index, file }, scope, () => removeImage(index, true),
      )),
    );
  }

  input.addEventListener("change", () => {
    pendingFiles.push(...Array.from(input.files ?? []));
    syncInputFiles();
    render();
  });

  return {
    getUrls: () => savedUrls,
    setImages(urls: string[] = []) {
      savedUrls = [...urls];
      pendingFiles = [];
      input.value = "";
      render();
    },
  };
}
