// Shared order labels and item summaries used by the table and CSV export.
import type { ProductRow } from "../templates.ts";
import { getOrderAmount, type OrderItem } from "../order-pricing.ts";

export const paymentMethodLabel: Record<string, string> = {
  bank_transfer: "Chuyển khoản",
  cod: "COD",
};

export function itemsSummary(items: OrderItem[], products: ProductRow[]) {
  if (!items.length) return "Dữ liệu sản phẩm không hợp lệ — cần kiểm tra đơn";
  return items.map((item) => products.find((product) => product.slug === item.productSlug)?.name ?? item.productSlug).join("\n");
}

export function quantitiesSummary(items: OrderItem[]) {
  return items.map((item) => item.quantity).join("\n");
}

export function moneyLabel(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? `${value.toLocaleString("vi-VN")}đ` : "—";
}

export function unitPricesSummary(items: OrderItem[]) {
  return items.map((item) => moneyLabel(item.unitPrice)).join("\n");
}

export function amountSummary(items: OrderItem[]) {
  return moneyLabel(getOrderAmount(items));
}
