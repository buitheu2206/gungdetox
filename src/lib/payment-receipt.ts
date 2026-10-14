// Receipt uploads are evidence for manual review; they never mark an order as paid.
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

export function getReceiptPath(orderId: string, uploadToken: string) {
  if (!UUID_PATTERN.test(orderId) || !UUID_PATTERN.test(uploadToken)) {
    throw new Error("Thông tin gửi ảnh không hợp lệ. Vui lòng liên hệ tiệm kèm mã đơn.");
  }
  return `${orderId}/${uploadToken}`;
}

export async function uploadPaymentReceipt(client: SupabaseClient, orderId: string, uploadToken: string, file: File) {
  validateReceipt(file);
  const path = getReceiptPath(orderId, uploadToken);
  try {
    const { error } = await client.storage.from(RECEIPT_BUCKET).upload(path, file, {
      contentType: file.type, upsert: false,
    });
    if (error) await verifyReceiptUpload(client, orderId, uploadToken, error);
    const { data: confirmed, error: confirmError } = await client.rpc("confirm_payment_receipt", {
      order_id: orderId, upload_token: uploadToken,
    });
    if (confirmError || !confirmed) {
      throw new Error("Ảnh đã lưu nhưng chưa gửi được xác nhận. Vui lòng bấm Xác nhận chuyển khoản để thử lại.", { cause: confirmError });
    }
  } catch (error) {
    console.error("Không gửi được ảnh chuyển khoản", { orderId, error });
    throw error;
  }
}

async function verifyReceiptUpload(client: SupabaseClient, orderId: string, uploadToken: string, uploadError: unknown) {
  // A retry can encounter an existing file when only the confirmation request failed.
  const { data: uploaded, error } = await client.rpc("has_payment_receipt", {
    order_id: orderId, upload_token: uploadToken,
  });
  if (!error && uploaded === true) return;
  throw new Error("Chưa gửi được ảnh. Đơn đã được tạo; vui lòng thử gửi lại hoặc liên hệ tiệm kèm mã đơn.", { cause: error ?? uploadError });
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
