// Shared behavior for static forms and dynamically rendered order rows.
function closeMenusOnViewportChange(event: Event) {
  document.querySelectorAll<HTMLElement>(".custom-select-list:popover-open").forEach((list) => {
    if (event.target instanceof Node && list.contains(event.target)) return;
    list.hidePopover();
  });
}

document.addEventListener("scroll", closeMenusOnViewportChange, true);
window.addEventListener("resize", closeMenusOnViewportChange);

export function syncCustomSelect(select: HTMLSelectElement) {
  const root = select.closest("[data-custom-select]")!;
  root.querySelector<HTMLElement>(".custom-select-value")!.textContent =
    select.options[select.selectedIndex]?.textContent ?? "";
  root.querySelector<HTMLButtonElement>(".custom-select-trigger")!.disabled = select.disabled;
}

// Dựng lại <li> từ chính <option> của select gốc mỗi lần mở — tránh phải
// giữ 2 nguồn dữ liệu (option thật + option hiển thị) đồng bộ tay.
function renderOptions(select: HTMLSelectElement, list: HTMLUListElement) {
  list.replaceChildren();
  const options = Array.from(select.options);
  for (const child of Array.from(select.children)) {
    if (child instanceof HTMLOptGroupElement) {
      const heading = document.createElement("li");
      heading.className = "option-group";
      heading.setAttribute("role", "presentation");
      heading.textContent = child.label;
      list.append(heading);
    }
    const groupOptions = child instanceof HTMLOptGroupElement
      ? Array.from(child.children) : [child];
    for (const option of groupOptions) {
      if (!(option instanceof HTMLOptionElement)) continue;
      const item = document.createElement("li");
      if (child instanceof HTMLOptGroupElement) item.className = "group-option";
      item.setAttribute("role", "option");
      item.tabIndex = -1;
      item.dataset.index = String(options.indexOf(option));
      item.setAttribute("aria-selected", String(option.selected));
      item.textContent = option.textContent;
      list.append(item);
    }
  }
}

function positionOptions(trigger: HTMLButtonElement, list: HTMLUListElement) {
  const bounds = trigger.getBoundingClientRect();
  const gap = 4;
  const viewportPadding = 8;
  list.style.width = `${bounds.width}px`;
  list.style.left = `${Math.max(viewportPadding, Math.min(bounds.left, innerWidth - bounds.width - viewportPadding))}px`;
  const spaceBelow = innerHeight - bounds.bottom - gap - viewportPadding;
  const spaceAbove = bounds.top - gap - viewportPadding;
  const placeBelow = spaceBelow >= list.offsetHeight || spaceBelow >= spaceAbove;
  list.style.maxHeight = `${Math.max(0, Math.min(240, placeBelow ? spaceBelow : spaceAbove))}px`;
  list.style.top = `${placeBelow ? bounds.bottom + gap : bounds.top - gap - list.offsetHeight}px`;
}

function bindSelectKeyboard(
  trigger: HTMLButtonElement, list: HTMLUListElement, open: () => void, close: () => void,
) {
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!list.matches(":popover-open")) open();
      else close();
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      open();
      const selected = list.querySelector<HTMLElement>('[aria-selected="true"]');
      (selected ?? list.querySelector<HTMLElement>("li[data-index]"))?.focus();
    }
  });

  list.addEventListener("keydown", (e) => {
    const options = Array.from(list.querySelectorAll<HTMLElement>("li[data-index]"));
    const index = options.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      options[(index + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      options[index]?.click();
    } else if (e.key === "Escape" || e.key === "Tab") {
      close();
      trigger.focus();
    }
  });

}

export function initCustomSelect(root: HTMLElement) {
  const select = root.querySelector("select") as HTMLSelectElement;
  const trigger = root.querySelector(".custom-select-trigger") as HTMLButtonElement;
  const list = root.querySelector(".custom-select-list") as HTMLUListElement;

  function syncLabel() {
    syncCustomSelect(select);
  }

  function open() {
    if (select.disabled) return;
    renderOptions(select, list);
    // The native popover layer keeps menus outside a scrolling table's clipping area.
    list.showPopover();
    positionOptions(trigger, list);
    root.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  }

  function close() {
    list.hidePopover();
    root.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", () => {
    if (!list.matches(":popover-open")) open();
    else close();
  });

  list.addEventListener("click", (e) => {
    const li = (e.target as HTMLElement).closest<HTMLLIElement>("li[data-index]");
    if (!li) return;
    select.selectedIndex = Number(li.dataset.index);
    select.dispatchEvent(new Event("change", { bubbles: true }));
    syncLabel();
    close();
    trigger.focus();
  });

  bindSelectKeyboard(trigger, list, open, close);

  list.addEventListener("toggle", (e) => {
    const open = (e as ToggleEvent).newState === "open";
    root.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", String(open));
  });

  // Label bọc ngoài click vào select ẩn (tabindex=-1 vẫn focus được bằng
  // label/script) — chuyển focus sang nút hiển thị cho đúng trải nghiệm.
  select.addEventListener("focus", () => trigger.focus());

  // Đồng bộ lại khi code khác tự set select.value (vd. fillForm lúc sửa sản
  // phẩm) hoặc khi form.reset() chạy — cả 2 trường hợp select gốc vẫn đổi
  // đúng giá trị, chỉ cần vẽ lại label hiển thị theo.
  select.addEventListener("change", syncLabel);
  select.closest("form")?.addEventListener("reset", () => setTimeout(syncLabel));

  syncLabel();
}
