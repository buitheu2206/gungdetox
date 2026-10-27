// Shared identifier for products and blog posts: lowercase, ASCII, dash-separated —
// a raw title with spaces/diacritics can't be used as a URL path segment as-is.
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics left by NFD (á -> a + ́)
    .replace(/đ/gi, "d") // đ/Đ don't decompose under NFD
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
