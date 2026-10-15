// Render dynamic rows and bind payment/status controls without owning list filtering.
import { escapeHtml as esc } from "../output";
import { getAstroScopeHtml } from "../astro-scope";
import { supabase } from "../supabase";
import { orderCode, type ProductRow } from "../templates";
import { initCustomSelect, syncCustomSelect } from "../initCustomSelect";
import { ORDER_STATUS_LABELS as statusLabel, getOrderDelivery, type OrderRow } from "../order-details";
import { saveOrderStatus } from "../order-status";
import { saveOrderPayment } from "../order-payment";
import { paymentMethodLabel, itemsSummary, unitPricesSummary, quantitiesSummary, amountSummary } from "./format";

const tbody = document.getElementById("orders-body")!;
const statusTemplate = document.getElementById("order-status-template") as HTMLTemplateElement;
// Astro chỉ gắn attribute scope CSS (data-astro-cid-*) cho phần tử render lúc build —
// <tr>/<td> dựng bằng innerHTML không tự có, nên cần kế thừa scope của OrderTable.astro
// để nhận các style viền, màu xen kẽ và trạng thái hover của bảng.
const cid = getAstroScopeHtml(document.getElementById("orders-table")!);

interface TableContext {
  cid: string;
  customerCounts: Map<string, number>;
}

function initOrderStatusSelect(sel: HTMLSelectElement): HTMLSelectElement {
  const root = statusTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
  const customSelect = root.querySelector("select")!;
  customSelect.id = `order-status-${sel.dataset.id}`;
  customSelect.className = sel.className;
  customSelect.dataset.id = sel.dataset.id;
  const selectedStatus = sel.value;
  customSelect.replaceChildren(...sel.childNodes);
  customSelect.value = selectedStatus;
  const list = root.querySelector<HTMLElement>(".custom-select-list")!;
  list.id = `${customSelect.id}-options`;
  const trigger = root.querySelector<HTMLButtonElement>(".custom-select-trigger")!;
  trigger.setAttribute("aria-controls", list.id);
  trigger.setAttribute("aria-label", `Trạng thái đơn ${sel.closest("tr")!.querySelector(".code")!.textContent}`);
  sel.replaceWith(root);
  initCustomSelect(root);
  return customSelect;
}

async function updateOrderStatus(sel: HTMLSelectElement, orders: OrderRow[]) {
  const id = sel.dataset.id!;
  const newStatus = sel.value;
  const order = orders.find((o) => o.id === id);
  const previousStatus = order?.status ?? "processing";
  sel.disabled = true;
  syncCustomSelect(sel);
  try {
    if (!order) throw new Error("Không tìm thấy đơn hàng. Vui lòng tải lại trang.");
    Object.assign(order, await saveOrderStatus(supabase, order, newStatus));
  } catch (error) {
    sel.value = previousStatus;
    console.error("Lỗi cập nhật trạng thái đơn hàng", { id, newStatus, error });
    alert("Lỗi cập nhật trạng thái: " + ((error as { message?: string })?.message ?? String(error)));
  } finally {
    sel.disabled = false;
    syncCustomSelect(sel);
  }
}

function orderRowHtml(o: OrderRow, context: TableContext) {
  const { cid } = context;
  const orderCountSoFar = context.customerCounts.get(o.id) ?? 0;
  const customerBadge = `<span class="badge ${orderCountSoFar > 1 ? "badge-returning" : "badge-new"}"${cid}>${orderCountSoFar}</span>`;
  const deliveryDate = getOrderDelivery(o).date;
  const deliveryTimeRange = getOrderDelivery(o).time;
  const deliveryNote = getOrderDelivery(o).note;
  return `
<tr data-id="${esc(o.id)}"${cid}>
  <td class="code"${cid}><a href="/don-hang/${encodeURIComponent(orderCode(o.phone, o.id))}"${cid}>${orderCode(o.phone, o.id)}</a></td>
  <td${cid}>${new Date(o.created_at).toLocaleDateString("vi-VN")}<br${cid} />${new Date(o.created_at).toLocaleTimeString("vi-VN")}</td>
  <td class="customer-cell"${cid}>${esc(o.customer_name)} ${customerBadge}</td>
  <td${cid}>${esc(o.phone)}</td>
  <td class="address-cell"${cid}>${esc(o.address)}, ${esc(o.district)}</td>
  <td${cid}>${deliveryDate !== "—" ? `<span class="badge badge-delivery"${cid}>${esc(deliveryDate)}</span>` : "—"}</td>
  <td${cid}>${esc(deliveryTimeRange)}</td>
  <td class="delivery-note-cell"${cid}>${esc(deliveryNote)}</td>
  <td class="order-items-cell order-products-cell"${cid}></td>
  <td class="order-items-cell order-prices-cell"${cid}></td>
  <td class="order-items-cell order-quantities-cell"${cid}></td>
  <td${cid}>${amountSummary(o.items)}</td>
  <td${cid}>${esc(o.bottles_returned ?? 0)}</td>
  <td${cid}>${esc(paymentMethodLabel[o.payment_method] ?? o.payment_method ?? "COD")}</td>
  <td${cid}>
    <label class="paid-toggle"${cid}>
      <input type="checkbox" class="paid-checkbox" data-id="${esc(o.id)}" ${o.paid ? "checked" : ""}${cid} />
      ${o.paid ? "Đã thanh toán" : "Chưa thanh toán"}
    </label>
  </td>
  <td${cid}>
    <select class="status-select" data-id="${esc(o.id)}"${cid}>
      ${Object.entries(statusLabel)
        .map(
          ([value, label]) =>
            `<option value="${value}" ${value === o.status ? "selected" : ""}>${label}</option>`
        )
        .join("")}
    </select>
  </td>
</tr>
`;
}

function bindOrderPayments(orders: OrderRow[]) {
  tbody.querySelectorAll<HTMLInputElement>(".paid-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => updateOrderPayment(cb, orders));
  });
}

async function updateOrderPayment(cb: HTMLInputElement, orders: OrderRow[]) {
  const id = cb.dataset.id!;
  const order = orders.find((o) => o.id === id);
  if (!order || cb.disabled) return;
  const paid = cb.checked;
  cb.disabled = true;
  try {
    Object.assign(order, await saveOrderPayment(supabase, id, paid));
    cb.closest("label")!.lastChild!.textContent = ` ${paid ? "Đã thanh toán" : "Chưa thanh toán"}`;
  } catch (error) {
    cb.checked = order.paid;
    alert(error instanceof Error ? error.message : "Không cập nhật được thanh toán.");
  } finally {
    cb.disabled = false;
  }
}

export function renderOrdersTable(orders: OrderRow[], products: ProductRow[], customerCounts: Map<string, number>) {
  if (orders.length === 0) {
    tbody.innerHTML = `<tr${cid}><td colspan="16"${cid}>Không có đơn nào khớp bộ lọc.</td></tr>`;
    return;
  }
  tbody.innerHTML = orders.map((order) => orderRowHtml(order, { cid, customerCounts })).join("");
  tbody.querySelectorAll<HTMLTableRowElement>("tr[data-id]").forEach((row, index) => {
    row.querySelector(".order-products-cell")!.textContent = itemsSummary(orders[index].items, products);
    row.querySelector(".order-prices-cell")!.textContent = unitPricesSummary(orders[index].items);
    row.querySelector(".order-quantities-cell")!.textContent = quantitiesSummary(orders[index].items);
  });

  bindOrderPayments(orders);
  tbody.querySelectorAll<HTMLSelectElement>(".status-select").forEach((select) => {
    const customSelect = initOrderStatusSelect(select);
    customSelect.addEventListener("change", () => updateOrderStatus(customSelect, orders));
  });
}
