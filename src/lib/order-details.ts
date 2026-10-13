// Shared display data and bounded lookup for the human-readable order code.
import type { OrderItem } from "./order-pricing";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  processing: "Đang xử lý",
  delivering: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

export interface OrderRow {
  id: string;
  phone: string;
  customer_name: string;
  address: string;
  district: string;
  items: OrderItem[];
  bottle_type: string;
  bottles_returned: number | null;
  shipping_fee_note: string | null;
  payment_method: string;
  paid: boolean;
  status: string;
  status_history: { status: string; at: string }[] | null;
  created_at: string;
}

export function getOrderCodeBounds(value: string) {
  const code = value.toUpperCase();
  const match = /^(\d{6})-([A-F0-9]{6})$/.exec(code);
  if (!match) return null;
  return {
    code,
    phoneSuffix: match[1],
    // UUIDs compare by bytes; these bounds cover exactly the six-character prefix.
    minId: `${match[2]}00-0000-0000-0000-000000000000`,
    maxId: `${match[2]}FF-FFFF-FFFF-FFFF-FFFFFFFFFFFF`,
  };
}

export function getDeliveryDetails(note: string | null | undefined) {
  const full = note?.match(/Giao ngày (.+?)\. Ghi chú của khách:/)?.[1];
  const customerNote = note?.match(/Ghi chú của khách: (.*?)\. Phí ship/s)?.[1];
  return {
    date: full?.match(/^(.+?)\s*\(/)?.[1] ?? full ?? "—",
    time: full?.match(/\((.*)\)$/)?.[1] ?? "—",
    schedule: full ?? "Chưa có lịch giao",
    note: customerNote === "(không có)" ? "—" : customerNote ?? "—",
  };
}
