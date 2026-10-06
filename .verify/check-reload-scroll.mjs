// Run: node .verify/check-reload-scroll.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const layout = readFileSync(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
const script = layout.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "Shared layout must include the scroll restoration script");
for (const type of ["reload", "navigate", "back_forward", undefined]) {
  const history = { scrollRestoration: "auto" };
  const events = [];
  const scrolls = [];
  runInNewContext(script, {
    history,
    requestAnimationFrame: (callback) => callback(),
    performance: { getEntriesByType: () => type ? [{ type }] : [] },
    window: {
      addEventListener: (...args) => events.push(args),
      scrollTo: (options) => scrolls.push(options),
    },
  });
  assert.equal(history.scrollRestoration, "manual");
  assert.equal(events.length, 1);
  assert.equal(events[0][0], "pageshow");
  events[0][1]();
  assert.equal(scrolls[0].top, 0);
  assert.equal(scrolls[0].left, 0);
  assert.equal(scrolls[0].behavior, "instant");
  events[0][1]();
  assert.equal(scrolls[1].top, 0);
}
console.log("PASS: reload, redirects, and history navigation reset scroll to the top.");
