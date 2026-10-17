// Admin order list orchestration: authorized loading, filters, pagination and export.
import { hasAdminAccess } from "../admin-access";
import { getAstroScopeHtml } from "../astro-scope";
import { loadAllRows, countOrdersByCustomer } from "../load-rows";
import { supabase } from "../supabase";
import type { ProductRow } from "../templates";
import type { OrderRow } from "../order-details";
import { resolveOrderItems } from "../order-pricing";
import { renderOrdersTable } from "./table";
import { exportOrdersCsv } from "./csv";

const tbody = document.getElementById("orders-body")!;
const cid = getAstroScopeHtml(document.getElementById("orders-table")!);
const statusChips = document.querySelectorAll<HTMLButtonElement>("#status-filter .chip");

let allOrders: OrderRow[] = [];
// Khách "quen" = đã có từ 2 đơn trở lên tính đến thời điểm đơn này (kể cả đơn này) — dựa theo
// toàn bộ đơn trong hệ thống (allOrders), không phải chỉ danh sách đang hiển thị sau khi lọc.
let customerCounts = new Map<string, number>();
const DISPLAY_PAGE_SIZE = 12;
let currentPage = 0;
let allProducts: ProductRow[] = [];
let activeStatus = "all";

const previousPage = document.getElementById("orders-previous") as HTMLButtonElement;
const nextPage = document.getElementById("orders-next") as HTMLButtonElement;
const pageLabel = document.getElementById("orders-page-label")!;
previousPage.addEventListener("click", () => { currentPage--; applyFilters(); });
nextPage.addEventListener("click", () => { currentPage++; applyFilters(); });

function applyFilters() {
  const filtered = allOrders.filter((o) => {
    if (activeStatus !== "all" && o.status !== activeStatus) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / DISPLAY_PAGE_SIZE));
  currentPage = Math.min(currentPage, pages - 1);
  renderOrdersTable(filtered.slice(currentPage * DISPLAY_PAGE_SIZE, (currentPage + 1) * DISPLAY_PAGE_SIZE), allProducts, customerCounts);
  pageLabel.textContent = `Trang ${currentPage + 1}/${pages} · ${filtered.length} đơn`;
  previousPage.disabled = currentPage === 0;
  nextPage.disabled = currentPage === pages - 1;
}

statusChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    statusChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeStatus = chip.dataset.status ?? "all";
    currentPage = 0;
    applyFilters();
  });
});

document.getElementById("export-csv-btn")!.addEventListener("click", () => {
  exportOrdersCsv(allOrders, allProducts);
});

async function loadOrders() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError && authError.name !== "AuthSessionMissingError") throw authError;
    if (!user || !await hasAdminAccess(supabase)) return;
    const loadedBefore = new Date().toISOString();
    const [ordersResult, productsResult] = await Promise.all([
      loadAllRows((from, to) => supabase.from("orders").select("*").lte("created_at", loadedBefore).order("created_at", { ascending: false }).order("id").range(from, to)),
      supabase.from("products").select("slug, name, type, price, price_retail"),
    ]);
    allProducts = productsResult.data ?? [];
    allOrders = ordersResult.map((order) => ({
      ...order, items: resolveOrderItems(order.items, allProducts),
    }));
    customerCounts = countOrdersByCustomer(allOrders);
    applyFilters();
    if (productsResult.error) {
      console.error("Không tải được tên và giá sản phẩm cho bảng đơn hàng", { error: productsResult.error });
      const warning = document.getElementById("order-products-warning")!;
      warning.textContent = "Không tải được tên và giá sản phẩm. Vui lòng tải lại trang; đơn thiếu giá vẫn hiện “—”.";
      warning.hidden = false;
    }
  } catch (error) {
    console.error("Không tải được bảng đơn hàng", { error });
    tbody.innerHTML = `<tr${cid}><td colspan="16"${cid}></td></tr>`;
    tbody.querySelector("td")!.textContent = `Lỗi tải đơn hàng: ${(error as { message?: string })?.message ?? String(error)}. Vui lòng tải lại trang.`;
  }
}

loadOrders();
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_IN") setTimeout(loadOrders, 0);
});
