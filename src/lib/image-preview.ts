// Shared thumbnail preview and removal for product and blog forms.
export function initMainImagePreview(
  input: HTMLInputElement,
  preview: HTMLElement,
  currentImage: HTMLElement,
  state: { getUrl: () => string | null; clearUrl: () => void },
) {
  const scope = Array.from(preview.attributes).find((attribute) => attribute.name.startsWith("data-astro-cid-"));
  const removeMainImage = preview.querySelector<HTMLButtonElement>("#remove-main-image")!;
  let mainPreviewUrl: string | null = null;

  function renderMainImagePreview() {
    if (mainPreviewUrl) URL.revokeObjectURL(mainPreviewUrl);
    const file = input.files?.[0];
    mainPreviewUrl = file ? URL.createObjectURL(file) : null;
    preview.querySelector("img")?.remove();
    const url = mainPreviewUrl ?? state.getUrl();
    if (url) {
      const image = document.createElement("img");
      image.src = url;
      image.alt = "Xem trước ảnh đại diện";
      if (scope) image.setAttribute(scope.name, "");
      preview.prepend(image);
    }
    preview.hidden = !url;
  }

  input.addEventListener("change", renderMainImagePreview);
  removeMainImage.addEventListener("click", () => {
    // Removing a pending replacement restores the saved image; a second click clears it.
    if (input.files?.length) input.value = "";
    else state.clearUrl();
    currentImage.textContent = state.getUrl() ? `Ảnh hiện tại: ${state.getUrl()}` : "";
    renderMainImagePreview();
  });

  return renderMainImagePreview;
}
