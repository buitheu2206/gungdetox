// Admin order list orchestration: authorized loading, server-side filters and pagination, export.
import { hasAdminAccess } from "../admin-access";
import { getAstroScopeHtml } from "../astro-scope";
import { loadAllRows } from "../load-rows";
import { supabase } from "../supabase";
import type { ProductRow } from "../templates";
import type { OrderRow } from "../order-details";
import { resolveOrderItems } from "../order-pricing";
import { renderOrdersTable } from "./table";
import { exportOrdersCsv } from "./csv";

const tbody = document.getElementById("orders-body")!;
const cid = getAstroScopeHtml(document.getElementById("orders-table")!);
const statusChips = document.querySelectorAll<HTMLButtonElement>("#status-filter .chip");

// Khách "quen" = đã có từ 2 đơn trở lên tính đến thời điểm đơn này (kể cả đơn này). View
// admin_order_list đếm trên toàn bộ đơn trong DB, không chỉ trang đang hiển thị.
type AdminOrderRow = OrderRow & { customer_order_count: number };
const DISPLAY_PAGE_SIZE = 12;
const ORDER_LIST_VIEW = "admin_order_list";
let currentPage = 0;
let allProducts: ProductRow[] = [];
let activeStatus = "all";
let loadedUserId: string | null = null;

const previousPage = document.getElementById("orders-previous") as HTMLButtonElement;
const nextPage = document.getElementById("orders-next") as HTMLButtonElement;
const pageLabel = document.getElementById("orders-page-label")!;
const exportButton = document.getElementById("export-csv-btn") as HTMLButtonElement;
previousPage.addEventListener("click", () => { currentPage--; loadOrderPage(); });
nextPage.addEventListener("click", () => { currentPage++; loadOrderPage(); });

statusChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    statusChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeStatus = chip.dataset.status ?? "all";
    currentPage = 0;
    loadOrderPage();
  });
});

function showLoadError(error: unknown) {
  console.error("Không tải được bảng đơn hàng", { page: currentPage, status: activeStatus, error });
  tbody.innerHTML = `<tr${cid}><td colspan="16"${cid}></td></tr>`;
  tbody.querySelector("td")!.textContent = `Lỗi tải đơn hàng: ${(error as { message?: string })?.message ?? String(error)}. Vui lòng tải lại trang.`;
}

async function loadOrderPage() {
  previousPage.disabled = nextPage.disabled = true;
  try {
    let query = supabase.from(ORDER_LIST_VIEW).select("*", { count: "exact" });
    if (activeStatus !== "all") query = query.eq("status", activeStatus);
    const from = currentPage * DISPLAY_PAGE_SIZE;
    const { data, count, error } = await query.order("created_at", { ascending: false }).order("id")
      .range(from, from + DISPLAY_PAGE_SIZE - 1);
    if (error) throw error;
    const total = count ?? 0;
    const pages = Math.max(1, Math.ceil(total / DISPLAY_PAGE_SIZE));
    // The last page can empty out after a status change or filter switch.
    if (!data?.length && currentPage > pages - 1) {
      currentPage = pages - 1;
      return loadOrderPage();
    }
    const rows = (data ?? []) as AdminOrderRow[];
    const pageOrders = rows.map((order) => ({ ...order, items: resolveOrderItems(order.items, allProducts) }));
    renderOrdersTable(pageOrders, allProducts, new Map(rows.map((order) => [order.id, order.customer_order_count])));
    pageLabel.textContent = `Trang ${currentPage + 1}/${pages} · ${total} đơn`;
    previousPage.disabled = currentPage === 0;
    nextPage.disabled = currentPage >= pages - 1;
  } catch (error) {
    showLoadError(error);
  }
}

// CSV covers every order regardless of the filter, so it is the only full download.
exportButton.addEventListener("click", async () => {
  exportButton.disabled = true;
  try {
    const orders = await loadAllRows<OrderRow>((from, to) => supabase.from("orders").select("*")
      .order("created_at", { ascending: false }).order("id").range(from, to));
    exportOrdersCsv(orders.map((order) => ({ ...order, items: resolveOrderItems(order.items, allProducts) })), allProducts);
  } catch (error) {
    console.error("Không xuất được CSV đơn hàng", { error });
    alert("Không xuất được CSV: " + ((error as { message?: string })?.message ?? String(error)));
  } finally {
    exportButton.disabled = false;
  }
});

async function loadOrders() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError && authError.name !== "AuthSessionMissingError") throw authError;
    if (!user || !await hasAdminAccess(supabase)) return;
    loadedUserId = user.id;
    const productsResult = await supabase.from("products").select("slug, name, type, price, price_retail");
    allProducts = productsResult.data ?? [];
    if (productsResult.error) {
      console.error("Không tải được tên và giá sản phẩm cho bảng đơn hàng", { error: productsResult.error });
      const warning = document.getElementById("order-products-warning")!;
      warning.textContent = "Không tải được tên và giá sản phẩm. Vui lòng tải lại trang; đơn thiếu giá vẫn hiện “—”.";
      warning.hidden = false;
    }
    await loadOrderPage();
  } catch (error) {
    showLoadError(error);
  }
}

loadOrders();
// Supabase re-emits SIGNED_IN whenever the tab regains focus; reload only for a different account.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session?.user.id !== loadedUserId) setTimeout(loadOrders, 0);
});
