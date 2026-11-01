// Inline feedback keeps native input constraints without browser validation popups.
export const VIETNAMESE_MOBILE_PATTERN = "\\s*(?:0|\\+84)\\s*[35789](?:\\s*[0-9]){8}\\s*";

// Order storage and lookup expect phone numbers in the domestic format.
export function normalizeVietnamesePhone(phone: string): string {
  return phone.replace(/\s+/g, "").replace(/^\+84/, "0");
}

export function initInputValidation(input: HTMLInputElement, error: HTMLElement) {
  function clearError() {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
    error.hidden = true;
  }

  function showError() {
    input.setAttribute("aria-invalid", "true");
    error.textContent = input.validity.valueMissing
      ? input.dataset.requiredMessage || "Vui lòng nhập trường này."
      : input.validity.patternMismatch
        ? input.title || "Giá trị không đúng định dạng."
        : input.validationMessage;
    error.hidden = false;
  }

  input.addEventListener("invalid", (event) => {
    event.preventDefault();
    showError();
  });
  input.addEventListener("input", () => {
    if (!input.hasAttribute("aria-invalid")) return;
    if (input.validity.valid) clearError();
    else showError();
  });
  input.form?.addEventListener("reset", clearError);
}
