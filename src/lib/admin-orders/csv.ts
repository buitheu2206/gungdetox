// Xuất toàn bộ đơn (không theo bộ lọc đang chọn) ra file CSV để mở bằng Excel/Sheets.
import { escapeHtml as esc, csvCell } from "../output.ts";
import { orderCode, type ProductRow } from "../templates.ts";
import { ORDER_STATUS_LABELS as statusLabel, getOrderDelivery, type OrderRow } from "../order-details.ts";
import { paymentMethodLabel, itemsSummary, unitPricesSummary, quantitiesSummary, amountSummary } from "./format.ts";

const csvHeader = [
  "Mã đơn", "Ngày đặt", "Khách", "SĐT", "Địa chỉ", "Ngày giao", "Khung giờ",
  "Ghi chú giao hàng", "Sản phẩm", "Đơn giá", "Số lượng", "Thành tiền", "Chai trả", "Hình thức TT",
  "Thanh toán", "Trạng thái",
];

export function orderToCsvRow(o: OrderRow, products: ProductRow[]): string[] {
  return [
    orderCode(o.phone, o.id),
    new Date(o.created_at).toLocaleString("vi-VN"),
    o.customer_name,
    o.phone,
    `${esc(o.address)}, ${esc(o.district)}`,
    getOrderDelivery(o).date,
    getOrderDelivery(o).time,
    getOrderDelivery(o).note,
    itemsSummary(o.items, products),
    unitPricesSummary(o.items),
    quantitiesSummary(o.items),
    amountSummary(o.items),
    String(o.bottles_returned ?? 0),
    paymentMethodLabel[o.payment_method] ?? o.payment_method ?? "COD",
    o.paid ? "Đã thanh toán" : "Chưa thanh toán",
    statusLabel[o.status] ?? o.status,
  ];
}

// Bọc trong dấu "" và nhân đôi dấu " bên trong — quy tắc escape chuẩn của CSV,
// bắt buộc vì địa chỉ/ghi chú khách nhập tự do có thể chứa dấu phẩy hoặc xuống dòng.
export function exportOrdersCsv(orders: OrderRow[], products: ProductRow[]) {
  const rows = [csvHeader, ...orders.map((order) => orderToCsvRow(order, products))];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  // Thêm BOM (\uFEFF) để Excel nhận đúng UTF-8, không thì chữ có dấu tiếng Việt
  // sẽ hiện sai (vd. "Đơn" thành ký tự lạ) khi mở file trực tiếp bằng Excel.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
