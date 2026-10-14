// Run on localhost with: await (await import('/tests/audit.browser.mjs')).runAuditBrowserTests()
import { initContentForm } from "../src/lib/content-form.ts";
import { sanitizePostHtml } from "../src/lib/output.ts";

function assert(value, message) {
  if (!value) throw new Error(message);
}

export async function runAuditBrowserTests() {
  const form = document.createElement("form");
  form.innerHTML = '<input><button type="submit">Save</button><button disabled>Disabled</button><div contenteditable="true"></div>';
  let resolve;
  let calls = 0;
  const ready = new Promise((done) => { resolve = done; });
  const submission = initContentForm(form, async () => { calls++; await ready; });
  form.dispatchEvent(new Event("submit", { cancelable: true }));
  form.dispatchEvent(new Event("submit", { cancelable: true }));
  assert(calls === 1 && submission.isSaving(), "Double submission must not run two saves");
  assert(form.querySelector("input").disabled && form.querySelector("div").contentEditable === "false", "Inputs and rich text must lock during save");
  resolve();
  await ready;
  await new Promise((done) => setTimeout(done, 0));
  assert(!submission.isSaving() && !form.querySelector("input").disabled, "Inputs must unlock after save");
  assert(form.querySelectorAll("button")[1].disabled, "Previously disabled controls must stay disabled");
  assert(form.querySelector("div").contentEditable === "true", "Rich text must unlock after save");
  const output = document.createElement("div");
  output.innerHTML = sanitizePostHtml('<p class="ql-align-center"><strong>Text</strong><img src=x onerror="alert(1)"><a href="javascript:alert(1)">Link</a></p>');
  assert(!output.querySelector("img, [onerror], [href]"), "Browser sanitizer must remove executable content");
  assert(output.querySelector("strong")?.textContent === "Text", "Browser sanitizer must preserve supported formatting");
  return "PASS: duplicate submit lock, editor/control restoration, browser rich-text sanitization";
}
