import assert from "node:assert/strict";
import { test } from "node:test";

class TestNode {}

function createMenu() {
  const option = new TestNode();
  const bounds = { top: 100, bottom: 140, left: 80, width: 300 };
  const trigger = { getBoundingClientRect: () => bounds };
  const root = { querySelector: () => trigger };
  const list = Object.assign(new TestNode(), {
    style: {},
    offsetHeight: 240,
    closeCount: 0,
    contains: (node) => node === list || node === option,
    closest: () => root,
    hidePopover() { list.closeCount += 1; },
  });
  return { list, bounds, option };
}

test("should keep custom select menus open while their viewport moves", async (context) => {
  const listeners = new Map();
  const menu = createMenu();
  const globals = {
    document: {
      addEventListener: (name, handler) => listeners.set(name, handler),
      querySelectorAll: () => [menu.list],
    },
    window: { addEventListener: (name, handler) => listeners.set(name, handler) },
    Node: TestNode,
    innerWidth: 1024,
    innerHeight: 768,
  };
  const previous = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  context.beforeEach(() => { menu.list.closeCount = 0; });

  try {
    await import("../src/lib/initCustomSelect.ts");

    await context.test("should keep the list open and anchored when the page scrolls", () => {
      listeners.get("scroll")({ target: document });
      assert.equal(menu.list.closeCount, 0);
      assert.equal(menu.list.style.top, "144px");
      menu.bounds.top = 60;
      menu.bounds.bottom = 100;
      listeners.get("scroll")({ target: document });
      assert.equal(menu.list.style.top, "104px");
    });

    await context.test("should preserve option scrolling without repositioning the list", () => {
      const position = { ...menu.list.style };
      listeners.get("scroll")({ target: menu.list });
      listeners.get("scroll")({ target: menu.option });
      assert.deepEqual(menu.list.style, position);
      assert.equal(menu.list.closeCount, 0);
    });

    await context.test("should reposition the open list within the resized viewport", () => {
      globalThis.innerWidth = 320;
      listeners.get("resize")({ target: window });
      assert.equal(menu.list.closeCount, 0);
      assert.equal(menu.list.style.left, "12px");
      assert.equal(menu.list.style.width, "300px");
    });
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
