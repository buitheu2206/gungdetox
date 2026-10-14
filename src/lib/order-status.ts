// Both admin views persist the same status history and keep payment state unchanged.
import type { SupabaseClient } from "@supabase/supabase-js";
import { ORDER_STATUS_LABELS, type OrderRow } from "./order-details.ts";

export async function saveOrderStatus(client: SupabaseClient, order: Pick<OrderRow, "id" | "status" | "status_history">, status: string) {
  if (!Object.hasOwn(ORDER_STATUS_LABELS, status)) throw new Error("Trạng thái đơn hàng không hợp lệ.");
  if (order.status === status) return { status, status_history: order.status_history ?? [] };
  const update = {
    status,
    status_history: [...(order.status_history ?? []), { status, at: new Date().toISOString() }],
  };
  try {
    const { data, error } = await client.from("orders").update(update).eq("id", order.id).select("id").single();
    if (error || !data) throw error ?? new Error("Không tìm thấy đơn hàng hoặc không có quyền cập nhật.");
    return update;
  } catch (error) {
    console.error("Không cập nhật được trạng thái đơn hàng", { id: order.id, status, error });
    throw new Error("Không cập nhật được trạng thái đơn hàng. Vui lòng thử lại.", { cause: error });
  }
}
