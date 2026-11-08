// Blog body rendering, split from output.ts so sanitize-html only ships to blog pages.
import sanitizeHtml from "sanitize-html";
import { escapeHtml as esc } from "./output.ts";
import { splitIntoParagraphs } from "./templates.ts";

export function sanitizePostHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ["p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "s", "blockquote", "ol", "ul", "li", "a", "span"],
    allowedAttributes: { a: ["href", "title"], li: ["data-list"] },
    allowedClasses: { "*": ["ql-align-center", "ql-align-right", "ql-align-justify", "ql-indent-1", "ql-indent-2", "ql-indent-3"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    parseStyleAttributes: false,
  });
}

// Trang admin/blog.astro dùng Quill (rich-text editor) nên bài viết MỚI lưu
// xuống cột `body` là HTML thật (đậm/gạch đầu dòng/link...), không còn văn bản
// thuần — render thẳng bằng set:html. Bài viết CŨ (thêm từ trước khi có Quill)
// vẫn là văn bản thuần không có thẻ HTML nào, nên phát hiện trường hợp đó và
// dùng lại splitIntoParagraphs để không vỡ layout các bài cũ.
export function renderPostBodyHtml(body?: string | null): string {
  const text = (body ?? "").trim();
  if (!text) return "";
  const isRichHtml = /<[a-z][\s\S]*>/i.test(text);
  if (isRichHtml) return sanitizePostHtml(text);
  return splitIntoParagraphs(text)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
}
