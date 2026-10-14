// Escape plain text at HTML/CSV boundaries; rich post markup uses an explicit allowlist.
import sanitizeHtml from "sanitize-html";

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function safeMediaUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim();
  return /^(https?:\/\/|\/(?!\/))/i.test(url) ? url : "";
}

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

export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  // Excel may interpret formulas even when the CSV field is quoted.
  // eslint-disable-next-line no-control-regex -- Control prefixes can hide spreadsheet formulas.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
