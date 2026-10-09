# Thông báo đơn hàng nội bộ

Function nhận webhook `INSERT` của `public.orders` và gửi email qua Resend. Danh sách nhận được cấu hình riêng, không lấy từ tài khoản quản trị hoặc dữ liệu khách hàng. Không cần thay đổi trang đặt hàng.

## Mẫu email HTML

Sửa `email-template.html`; toàn bộ CSS nằm trong file này (inline cho khả năng tương thích email và `<style>` cho màn hình nhỏ). Mẫu gồm thông báo, tên khách, số điện thoại, sản phẩm/số lượng, địa chỉ và thời điểm khách chọn nhận hàng. Thời điểm nhận hàng được trích từ `shipping_fee_note` theo định dạng hiện có của trang đặt hàng; đơn cũ thiếu thông tin sẽ hiển thị rõ. Sản phẩm hiển thị bằng `productSlug` được lưu trong đơn, giống bảng quản trị.

Sau khi sửa mẫu, chạy `node scripts/build-order-email-function.mjs` từ thư mục gốc repo để cập nhật entry point. Script nhúng mẫu vào mã function để không phụ thuộc đọc file HTML ở runtime. Chạy `node scripts/build-order-email-function.mjs --dashboard` để xuất toàn bộ mã cho Dashboard. Dữ liệu động được escape trước khi đưa vào HTML; email cũng kèm bản văn bản thuần.

## Cấu hình và gửi thử

1. Tạo tài khoản Resend bằng `nghiabh.it@gmail.com`. Địa chỉ gửi thử `onboarding@resend.dev` chỉ gửi được đến email tài khoản Resend; muốn gửi đến danh sách khác cần xác minh tên miền gửi.
2. Trong Supabase **Edge Functions → Secrets**, thiết lập các biến trong `.env.example`. Tạo `ORDER_WEBHOOK_SECRET` ngẫu nhiên bằng `openssl rand -hex 32`. Không lưu key hoặc secret vào Git hay code phía trình duyệt.
3. Trong Dashboard **Edge Functions → resend-email → Code**, dán mã xuất từ script `--dashboard` vào file `index.ts`, rồi chọn **Deploy updates**. Giữ thiết lập hiện có **Verify JWT with legacy secret: OFF**; handler kiểm tra secret riêng và từ chối yêu cầu thiếu hoặc sai `x-order-webhook-secret`. Bản local có `config.toml` tương ứng nếu sau này deploy bằng CLI.
4. Trong mục **Test** của function, dùng POST, header `x-order-webhook-secret` bằng secret đã cấu hình và body từ `test-payload.json`. Payload này không tạo đơn thật. Kiểm tra email trong Resend và hộp thư người nhận; phản hồi thành công chỉ xác nhận Resend đã nhận yêu cầu, không đảm bảo thư đã vào inbox.
5. Sau khi gửi thử thành công, tạo **Database Webhook** cho bảng `public.orders`, chỉ chọn sự kiện **INSERT**. Chọn HTTP POST đến URL của function, kèm `Content-Type: application/json` và `x-order-webhook-secret`. Giữ webhook tắt trước khi hoàn tất bước thử.

Function ghi log thành công/lỗi theo ID đơn và dùng idempotency key theo ID đơn để tránh email trùng trong thời hạn lưu key của Resend. Nếu gửi lỗi, đơn vẫn được lưu; kiểm tra log và gửi lại webhook cho cùng đơn. Phiên bản này chưa có hàng đợi tự động gửi lại.
