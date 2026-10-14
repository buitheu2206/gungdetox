// Serialize editor saves and restore controls even when validation, uploads or DB writes fail.
export function initContentForm(form: HTMLFormElement, save: () => Promise<void>) {
  let saving = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (saving) return;
    saving = true;
    const controls = Array.from(form.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement>("input, button, select, textarea"));
    const disabledBefore = controls.map((control) => control.disabled);
    const editors = Array.from(form.querySelectorAll<HTMLElement>('[contenteditable="true"]'));
    controls.forEach((control) => { control.disabled = true; });
    editors.forEach((editor) => { editor.contentEditable = "false"; });
    try {
      await save();
    } catch (error) {
      console.error("Không lưu được nội dung", { error });
      alert("Không lưu được. Ảnh đã tải sẽ được dùng lại khi thử lại: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      saving = false;
      controls.forEach((control, index) => { control.disabled = disabledBefore[index]; });
      editors.forEach((editor) => { editor.contentEditable = "true"; });
    }
  });
  return { isSaving: () => saving };
}
