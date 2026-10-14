// Admin payment confirmation updates only the payment flag in both order views.
import type { SupabaseClient } from "@supabase/supabase-js";

export async function saveOrderPayment(client: SupabaseClient, orderId: string, paid: boolean) {
  if (typeof orderId !== "string" || !orderId.trim() || typeof paid !== "boolean") {
    throw new Error("Thông tin xác nhận thanh toán không hợp lệ.");
  }
  try {
    const { data, error } = await client.from("orders").update({ paid }).eq("id", orderId).select("id").single();
    if (error || !data) throw error ?? new Error("Không tìm thấy đơn hàng hoặc không có quyền cập nhật.");
    return { paid };
  } catch (error) {
    console.error("Không cập nhật được thanh toán đơn hàng", { id: orderId, paid, error });
    throw new Error("Không cập nhật được thanh toán. Vui lòng thử lại.", { cause: error });
  }
}
