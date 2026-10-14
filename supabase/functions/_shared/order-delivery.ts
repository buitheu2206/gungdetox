// One compatibility boundary for new structured delivery data and legacy notes.
export interface DeliveryFields {
  shipping_fee_note?: string | null;
  delivery_date?: string | null;
  delivery_time?: string | null;
  delivery_note?: string | null;
}

export function getDeliveryDetails(note: string | null | undefined) {
  const full = note?.match(/Giao ngày (.+?)\. Ghi chú của khách:/)?.[1];
  const customerNote = note?.match(/Ghi chú của khách: (.*)\. Phí ship/s)?.[1];
  return {
    date: full?.match(/^(.+?)\s*\(/)?.[1] ?? full ?? "—",
    time: full?.match(/\((.*)\)$/)?.[1] ?? "—",
    schedule: full ?? "Chưa có lịch giao",
    note: customerNote === "(không có)" ? "—" : customerNote ?? "—",
  };
}

export function getOrderDelivery(order: DeliveryFields) {
  if (!order.delivery_date) return getDeliveryDetails(order.shipping_fee_note);
  const [year, month, day] = order.delivery_date.split("-");
  const date = `${day}/${month}/${year}`;
  return {
    date,
    time: order.delivery_time || "—",
    schedule: `${date}${order.delivery_time ? ` (${order.delivery_time})` : ""}`,
    note: order.delivery_note || "—",
  };
}
