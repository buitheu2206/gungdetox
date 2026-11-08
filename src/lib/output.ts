// Escape plain text at HTML/CSV boundaries; rich post markup lives in post-html.ts.
// Keep this module dependency-free: the header order lookup loads it on every page.

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function safeMediaUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim();
  return /^(https?:\/\/|\/(?!\/))/i.test(url) ? url : "";
}

export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  // Excel may interpret formulas even when the CSV field is quoted.
  // eslint-disable-next-line no-control-regex -- Control prefixes can hide spreadsheet formulas.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
