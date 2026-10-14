// Public lookup never queries the orders table or returns customer contact details.
import type { SupabaseClient } from "@supabase/supabase-js";

interface PublicOrderSummary {
  code: string;
  status: string;
  paid: boolean;
  items: unknown;
  bottles_returned: number | null;
  created_at: string;
}

export async function lookupCustomerOrder(client: SupabaseClient, code: string, phone: string) {
  const orderCode = code.trim().toUpperCase();
  const customerPhone = phone.trim();
  if (!/^\d{6}-[A-F0-9]{6}$/.test(orderCode) || !/^0\d{9}$/.test(customerPhone)) {
    throw new Error("Nhập đúng mã đơn và SĐT 10 số đã dùng khi đặt hàng.");
  }
  const { data, error } = await client.rpc("lookup_order", { order_code: orderCode, customer_phone: customerPhone });
  if (error) throw new Error("Không tra cứu được đơn hàng. Vui lòng thử lại.", { cause: error });
  return data as PublicOrderSummary | null;
}
