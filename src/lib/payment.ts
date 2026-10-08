// Dùng chung hướng dẫn chuyển khoản ở bước xác nhận và sau khi tạo đơn.
export const DEPOSIT_AMOUNT = 200_000;
export const DEPOSIT_LABEL = `Cọc ${DEPOSIT_AMOUNT.toLocaleString("vi-VN")}đ`;
export const BANK_QR_URL = "https://img.vietqr.io/image/970436-1065425789-qr_only.png";

export function getPaymentInstructions(isDeposit: boolean, orderCode?: string) {
  const qrUrl = new URL(BANK_QR_URL);
  if (isDeposit) qrUrl.searchParams.set("amount", String(DEPOSIT_AMOUNT));
  if (orderCode) qrUrl.searchParams.set("addInfo", orderCode);

  return {
    paymentMethod: "bank_transfer",
    qrUrl: qrUrl.toString(),
    title: isDeposit ? "💳 Thông tin chuyển khoản tiền cọc" : "💳 Thông tin chuyển khoản",
    instructions: isDeposit
      ? `${DEPOSIT_LABEL} để xác nhận đơn. Tiệm xác nhận đơn sau khi nhận tiền cọc.`
      : "Vui lòng chuyển khoản trước khi giao hàng.",
    orderNote: isDeposit ? `${DEPOSIT_LABEL} qua chuyển khoản để xác nhận đơn` : "",
  };
}
