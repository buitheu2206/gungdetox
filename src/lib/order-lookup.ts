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

// Either the code or the phone alone is enough to search — whichever the
// customer remembers. Accept whatever separators they typed (or none).
export async function lookupCustomerOrder(client: SupabaseClient, code: string, phone: string) {
  const codeChars = code.toUpperCase().replace(/[^0-9A-F]/g, "");
  const customerPhone = phone.replace(/\D/g, "");
  const codeGiven = codeChars.length > 0 || code.trim().length > 0;
  const phoneGiven = customerPhone.length > 0 || phone.trim().length > 0;
  const orderCode = codeGiven ? `${codeChars.slice(0, 6)}-${codeChars.slice(6)}` : null;

  if (codeGiven && !/^\d{6}[0-9A-F]{6}$/.test(codeChars)) {
    throw new Error("Nhập đúng mã đơn (VD: 123456-ABCDEF) hoặc để trống và chỉ nhập SĐT.");
  }
  if (phoneGiven && !/^0\d{9}$/.test(customerPhone)) {
    throw new Error("Nhập đúng SĐT 10 số đã dùng khi đặt hàng, hoặc để trống và chỉ nhập mã đơn.");
  }
  if (!codeGiven && !phoneGiven) {
    throw new Error("Nhập mã đơn hoặc số điện thoại đã dùng khi đặt hàng.");
  }

  const { data, error } = await client.rpc("lookup_order", {
    order_code: orderCode, customer_phone: phoneGiven ? customerPhone : null,
  });
  if (error) throw new Error("Không tra cứu được đơn hàng. Vui lòng thử lại.", { cause: error });
  return (data ?? []) as PublicOrderSummary[];
}
