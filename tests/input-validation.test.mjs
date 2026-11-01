import assert from "node:assert/strict";
import { test } from "node:test";
import { initInputValidation, normalizeVietnamesePhone, VIETNAMESE_MOBILE_PATTERN } from "../src/lib/input-validation.ts";

function createInput() {
  const attributes = new Map();
  const input = Object.assign(new EventTarget(), {
    dataset: { requiredMessage: "Vui lòng nhập số điện thoại" },
    validity: { valid: false, valueMissing: true, patternMismatch: false },
    title: "Vui lòng nhập số di động Việt Nam hợp lệ",
    validationMessage: "Please fill out this field.",
    form: new EventTarget(),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
    hasAttribute: (name) => attributes.has(name),
  });
  const error = { hidden: true, textContent: "" };
  initInputValidation(input, error);
  return { input, error, attributes };
}

test("should show a required error inline and suppress the browser popup", () => {
  const { input, error, attributes } = createInput();
  const event = new Event("invalid", { cancelable: true });
  input.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(error.hidden, false);
  assert.equal(error.textContent, "Vui lòng nhập số điện thoại");
  assert.equal(attributes.get("aria-invalid"), "true");
});

test("should update an existing error for malformed input and clear it after correction", () => {
  const { input, error, attributes } = createInput();
  input.dispatchEvent(new Event("invalid", { cancelable: true }));
  input.validity = { valid: false, valueMissing: false, patternMismatch: true };
  input.dispatchEvent(new Event("input"));
  assert.equal(error.textContent, input.title);
  input.validity = { valid: true, valueMissing: false, patternMismatch: false };
  input.dispatchEvent(new Event("input"));
  assert.equal(error.hidden, true);
  assert.equal(error.textContent, "");
  assert.equal(attributes.has("aria-invalid"), false);
});

test("should leave untouched fields quiet and clear errors when the form resets", () => {
  const { input, error, attributes } = createInput();
  input.dispatchEvent(new Event("input"));
  assert.equal(error.hidden, true);
  input.dispatchEvent(new Event("invalid", { cancelable: true }));
  input.form.dispatchEvent(new Event("reset"));
  assert.equal(error.hidden, true);
  assert.equal(error.textContent, "");
  assert.equal(attributes.has("aria-invalid"), false);
});

test("should preserve the default required message and native numeric constraint messages", () => {
  const { input, error } = createInput();
  delete input.dataset.requiredMessage;
  input.dispatchEvent(new Event("invalid", { cancelable: true }));
  assert.equal(error.textContent, "Vui lòng nhập trường này.");
  input.validity = { valid: false, valueMissing: false, patternMismatch: false };
  input.validationMessage = "Value must be greater than or equal to 1.";
  input.dispatchEvent(new Event("input"));
  assert.equal(error.textContent, input.validationMessage);
});

test("should accept domestic and +84 mobile numbers with spaces and reject invalid formats", () => {
  const pattern = new RegExp(`^(?:${VIETNAMESE_MOBILE_PATTERN})$`);
  for (const phone of [
    "0321234567", "0551234567", "0701234567", "0888267009", "0901234567",
    "+84 946436011", "+84901234567", "+84 946 436 011", "090 123 4567", " 0901234567 ",
  ]) {
    assert.equal(pattern.test(phone), true, phone);
  }
  for (const phone of [
    "", "090123456", "09012345678", "0101234567", "0201234567", "0401234567", "0601234567",
    "+84 0946436011", "+84 94643601", "+84 9464360111", "+1 946436011", "090-123-4567", "090123456a",
  ]) {
    assert.equal(pattern.test(phone), false, phone);
  }
});

test("should normalize domestic and +84 phone numbers before storing the order", () => {
  for (const [phone, expected] of [
    ["+84 946436011", "0946436011"],
    ["+84946436011", "0946436011"],
    ["+84 946 436 011", "0946436011"],
    ["0946 436 011", "0946436011"],
    [" 0946436011 ", "0946436011"],
    ["", ""],
  ]) {
    assert.equal(normalizeVietnamesePhone(phone), expected);
  }
});
