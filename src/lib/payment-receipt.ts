// Receipt uploads precede order creation: the order only exists once its receipt is in storage.
import type { SupabaseClient } from "@supabase/supabase-js";

export const RECEIPT_BUCKET = "payment-receipts";
export const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
export const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SIGNED_URL_SECONDS = 60 * 60;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateReceipt(file: Pick<File, "size" | "type">) {
  if (!RECEIPT_TYPES.includes(file.type)) throw new Error("Vui lòng chọn ảnh JPG, PNG hoặc WebP.");
  if (file.size <= 0) throw new Error("Ảnh đang trống. Vui lòng chọn ảnh khác.");
  if (file.size > MAX_RECEIPT_SIZE) throw new Error("Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.");
}

export function getReceiptPath(orderId: string) {
  if (!UUID_PATTERN.test(orderId)) {
    throw new Error("Thông tin gửi ảnh không hợp lệ. Vui lòng liên hệ tiệm kèm mã đơn.");
  }
  return `${orderId}/receipt`;
}

export async function uploadPaymentReceipt(client: SupabaseClient, orderId: string, orderData: unknown, file: File) {
  validateReceipt(file);
  const path = getReceiptPath(orderId);
  try {
    const { error } = await client.storage.from(RECEIPT_BUCKET).upload(path, file, {
      contentType: file.type, upsert: false,
    });
    if (error) await verifyReceiptUpload(client, orderId, error);
    const { data: order, error: createError } = await client.rpc("create_order_with_receipt", {
      order_data: orderData, order_id: orderId,
    }).single<{ id: string }>();
    if (createError || !order) {
      throw new Error("Ảnh đã lưu nhưng chưa ghi nhận được đơn hàng. Vui lòng bấm Xác nhận đặt hàng để thử lại.", { cause: createError });
    }
  } catch (error) {
    console.error("Không gửi được ảnh chuyển khoản", { orderId, error });
    throw error;
  }
}

async function verifyReceiptUpload(client: SupabaseClient, orderId: string, uploadError: unknown) {
  // A retry can encounter an existing file when only the confirmation request failed.
  const { data: uploaded, error } = await client.rpc("has_payment_receipt", { order_id: orderId });
  if (!error && uploaded === true) return;
  throw new Error("Chưa gửi được ảnh. Vui lòng thử gửi lại hoặc liên hệ tiệm kèm mã đơn.", { cause: error ?? uploadError });
}

export async function getPaymentReceiptUrl(client: SupabaseClient, orderId: string) {
  if (!UUID_PATTERN.test(orderId)) throw new Error("Mã định danh đơn hàng không hợp lệ.");
  const bucket = client.storage.from(RECEIPT_BUCKET);
  try {
    const { data: files, error: listError } = await bucket.list(orderId, { limit: 1 });
    if (listError) throw listError;
    if (!files?.length) return null;
    const { data, error } = await bucket.createSignedUrl(`${orderId}/${files[0].name}`, SIGNED_URL_SECONDS);
    if (error) throw error;
    if (!data?.signedUrl) throw new Error("Không tạo được đường dẫn xem ảnh.");
    return data.signedUrl;
  } catch (error) {
    console.error("Không tải được ảnh chuyển khoản", { orderId, error });
    throw new Error("Không tải được ảnh chuyển khoản. Vui lòng thử lại.", { cause: error });
  }
}
