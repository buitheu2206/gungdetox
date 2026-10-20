// Receipt uploads precede order creation: the order only exists once its receipt is in storage.
import type { SupabaseClient } from "@supabase/supabase-js";

export const RECEIPT_BUCKET = "payment-receipts";
export const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
export const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SIGNED_URL_SECONDS = 60 * 60;
const RECEIPT_VERSION_BYTES = 32;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const receiptVersions = new WeakMap<SupabaseClient, Map<string, string>>();

export class ExistingOrderDetailsError extends Error {
  constructor() {
    super("Đơn hàng đã được ghi nhận trước đó. Thông tin vừa sửa chưa được lưu. Vui lòng liên hệ tiệm qua Zalo hoặc hotline để điều chỉnh.");
    this.name = "ExistingOrderDetailsError";
  }
}

export function validateReceipt(file: Pick<File, "size" | "type">) {
  if (!RECEIPT_TYPES.includes(file.type)) throw new Error("Vui lòng chọn ảnh JPG, PNG hoặc WebP.");
  if (file.size <= 0) throw new Error("Ảnh đang trống. Vui lòng chọn ảnh khác.");
  if (file.size > MAX_RECEIPT_SIZE) throw new Error("Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.");
}

export function getReceiptPath(orderId: string, fingerprint?: string) {
  if (!UUID_PATTERN.test(orderId)) {
    throw new Error("Thông tin gửi ảnh không hợp lệ. Vui lòng liên hệ tiệm kèm mã đơn.");
  }
  if (fingerprint !== undefined && !/^[0-9a-f]{64}$/.test(fingerprint)) {
    throw new Error("Dấu vân tay ảnh chuyển khoản không hợp lệ.");
  }
  return `${orderId}/receipt${fingerprint ? `-${fingerprint}` : ""}`;
}

export async function uploadPaymentReceipt(client: SupabaseClient, orderId: string, orderData: unknown, file: File) {
  validateReceipt(file);
  if (!orderData || typeof orderData !== "object" || Array.isArray(orderData)) throw new Error("Thông tin đơn hàng không hợp lệ.");
  getReceiptPath(orderId);
  try {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const path = await getUploadPath(client, orderId, fingerprint);
    await storeReceipt(client, orderId, path, file);
    const { data: order, error: createError } = await client.rpc("create_order_with_receipt", {
      order_data: { ...orderData, payment_receipt_path: path }, order_id: orderId,
    }).single<{ id: string }>();
    if (createError || !order) {
      if (createError?.details === "ORDER_ALREADY_CREATED_WITH_DIFFERENT_DETAILS") throw new ExistingOrderDetailsError();
      if (createError?.message.includes("Đơn hàng đã được ghi nhận với ảnh khác")) {
        throw new Error(createError.message, { cause: createError });
      }
      throw new Error("Ảnh đã lưu nhưng chưa ghi nhận được đơn hàng. Vui lòng bấm Xác nhận đặt hàng để thử lại.", { cause: createError });
    }
  } catch (error) {
    console.error("Không gửi được ảnh chuyển khoản", { orderId, error });
    throw error;
  }
}

async function getUploadPath(client: SupabaseClient, orderId: string, fingerprint: string) {
  const versions = receiptVersions.get(client) ?? new Map<string, string>();
  receiptVersions.set(client, versions);
  const key = `${orderId}:${fingerprint}`;
  let path = versions.get(key) ?? getReceiptPath(orderId, fingerprint);
  const { data: retired, error } = await client.rpc("is_payment_receipt_retired", { receipt_path: path });
  if (error || typeof retired !== "boolean") throw new Error("Không kiểm tra được ảnh chuyển khoản. Vui lòng thử lại.", { cause: error });
  if (retired) {
    // Never reuse a deleted name: a delayed cleanup request could still target it.
    const version = Array.from(crypto.getRandomValues(new Uint8Array(RECEIPT_VERSION_BYTES)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    path = getReceiptPath(orderId, version);
  }
  versions.set(key, path);
  return path;
}

async function storeReceipt(client: SupabaseClient, orderId: string, path: string, file: File) {
  let uploadError: unknown;
  try {
    const { error } = await client.storage.from(RECEIPT_BUCKET).upload(path, file, {
      contentType: file.type, upsert: false,
    });
    if (!error) return;
    uploadError = error;
  } catch (error) {
    uploadError = error;
  }
  // Only reuse the exact file contents, never a different receipt under the same order ID.
  try {
    const { data: uploaded, error } = await client.rpc("has_payment_receipt", { order_id: orderId, receipt_path: path });
    if (error || typeof uploaded !== "boolean") throw error ?? new Error("Thiếu trạng thái ảnh chuyển khoản.");
    if (uploaded) return;
  } catch (error) {
    throw new Error("Chưa kiểm tra được ảnh đã lưu. Vui lòng thử xác nhận lại.", { cause: error });
  }
  throw new Error("Chưa gửi được ảnh. Vui lòng thử gửi lại hoặc liên hệ tiệm kèm mã đơn.", { cause: uploadError });
}

export async function getPaymentReceiptUrl(client: SupabaseClient, orderId: string) {
  if (!UUID_PATTERN.test(orderId)) throw new Error("Mã định danh đơn hàng không hợp lệ.");
  const bucket = client.storage.from(RECEIPT_BUCKET);
  try {
    const { data: order, error: orderError } = await client.from("orders")
      .select("payment_receipt_path, payment_receipt_submitted_at").eq("id", orderId).single();
    if (orderError) throw orderError;
    if (!order?.payment_receipt_submitted_at) return null;
    const path = order.payment_receipt_path ?? getReceiptPath(orderId);
    if (path !== getReceiptPath(orderId) && !new RegExp(`^${orderId}/receipt-[0-9a-f]{64}$`).test(path)) {
      throw new Error("Đường dẫn ảnh không thuộc đơn hàng này.");
    }
    const { data, error } = await bucket.createSignedUrl(path, SIGNED_URL_SECONDS);
    if (error) throw error;
    if (!data?.signedUrl) throw new Error("Không tạo được đường dẫn xem ảnh.");
    return data.signedUrl;
  } catch (error) {
    console.error("Không tải được ảnh chuyển khoản", { orderId, error });
    throw new Error("Không tải được ảnh chuyển khoản. Vui lòng thử lại.", { cause: error });
  }
}
