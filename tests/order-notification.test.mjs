import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { EMAIL_TEMPLATE } from "../supabase/functions/resend-email/email-template.ts";

test("should load the current HTML and CSS from a separate template module", () => {
  const emailTemplate = readFileSync(new URL("../supabase/functions/resend-email/email-template.html", import.meta.url), "utf8");
  const entry = readFileSync(new URL("../supabase/functions/resend-email/index.ts", import.meta.url), "utf8");
  assert.equal(EMAIL_TEMPLATE, emailTemplate, "Run node scripts/build-order-email-function.mjs after editing the template");
  assert.ok(!entry.includes("<!doctype html>"), "The entry point must not embed the email HTML");
  assert.ok(emailTemplate.includes("<style>"));
});
