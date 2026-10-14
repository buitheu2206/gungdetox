// Signed URLs keep transfer screenshots private while allowing admins to open the original.
import { supabase } from "./supabase";
import { getPaymentReceiptUrl } from "./payment-receipt";

export async function renderPaymentReceipt(root: HTMLElement, orderId: string) {
  const status = root.querySelector<HTMLElement>(".receipt-status")!;
  const link = root.querySelector<HTMLAnchorElement>(".receipt-link")!;
  const image = link.querySelector("img")!;
  link.hidden = true;
  link.removeAttribute("href");
  image.removeAttribute("src");
  status.hidden = false;
  status.textContent = "Đang tải ảnh chuyển khoản…";
  root.dataset.orderId = orderId;
  const request = String(Number(root.dataset.receiptRequest ?? 0) + 1);
  root.dataset.receiptRequest = request;
  try {
    const url = await getPaymentReceiptUrl(supabase, orderId);
    if (root.dataset.orderId !== orderId || root.dataset.receiptRequest !== request) return;
    status.textContent = "Khách chưa gửi ảnh chuyển khoản.";
    if (!url) return;
    link.href = url;
    image.onerror = () => {
      if (root.dataset.orderId !== orderId || root.dataset.receiptRequest !== request) return;
      link.hidden = true;
      status.hidden = false;
      status.textContent = "Không mở được ảnh chuyển khoản. Vui lòng tải lại trang.";
      console.error("Không mở được ảnh chuyển khoản", { orderId });
    };
    image.src = url;
    link.hidden = false;
    status.hidden = true;
  } catch (error) {
    if (root.dataset.orderId !== orderId || root.dataset.receiptRequest !== request) return;
    status.textContent = error instanceof Error ? error.message : "Không tải được ảnh chuyển khoản.";
  }
}
