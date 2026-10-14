// Product and blog detail pages share thumbnail rendering and selection.
import { getAstroScope } from "./astro-scope.ts";

export function initDetailGallery(gallery: HTMLElement | null, imageId: string) {
  // Delegate to the gallery because thumbnails may only appear after a refresh.
  gallery?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".thumb");
    const image = document.getElementById(imageId) as HTMLImageElement | null;
    if (!gallery || !button || !image || !button.dataset.src) return;
    image.src = button.dataset.src;
    gallery.querySelectorAll(".thumb").forEach((thumb) => thumb.classList.remove("active"));
    button.classList.add("active");
  });

  return function renderThumbs(images: string[]) {
    if (!gallery) return;
    let thumbs = gallery.querySelector<HTMLElement>("#gallery-thumbs");
    if (images.length <= 1) {
      thumbs?.remove();
      return;
    }
    const scope = getAstroScope(gallery);
    if (!thumbs) {
      thumbs = document.createElement("div");
      thumbs.id = "gallery-thumbs";
      thumbs.className = "gallery-thumbs";
      gallery.appendChild(thumbs);
    }
    if (scope) thumbs.setAttribute(scope, "");
    thumbs.replaceChildren(...images.map((src, index) => {
      const button = document.createElement("button");
      button.className = `thumb${index === 0 ? " active" : ""}`;
      button.dataset.src = src;
      const image = document.createElement("img");
      image.src = src;
      image.alt = "";
      if (scope) [button, image].forEach((element) => element.setAttribute(scope, ""));
      button.append(image);
      return button;
    }));
  };
}
