# Thông báo đơn hàng nội bộ

Function nhận webhook `INSERT` của `public.orders` và gửi email qua Resend. Danh sách nhận được cấu hình riêng, không lấy từ tài khoản quản trị hoặc dữ liệu khách hàng. Không cần thay đổi trang đặt hàng.

## Mẫu email HTML

Sửa `email-template.html`; toàn bộ CSS nằm trong file này (inline cho khả năng tương thích email và `<style>` cho màn hình nhỏ). Mẫu gồm thông báo, tên khách, số điện thoại, sản phẩm/số lượng, địa chỉ và thời điểm khách chọn nhận hàng. Thời điểm nhận hàng được trích từ `shipping_fee_note` theo định dạng hiện có của trang đặt hàng; đơn cũ thiếu thông tin sẽ hiển thị rõ. Sản phẩm hiển thị bằng `productSlug` được lưu trong đơn, giống bảng quản trị.

Sau khi sửa mẫu, chạy `node scripts/build-order-email-function.mjs` từ thư mục gốc repo để cập nhật `email-template.ts`. File này chứa HTML dễ đọc dưới dạng template literal; `index.ts` chỉ import mẫu, không nhúng HTML. Dashboard không đóng gói file HTML tĩnh, nên dùng module riêng để giữ mẫu tách khỏi handler mà không cần đọc file ở runtime. Dữ liệu động được escape trước khi đưa vào HTML; email cũng kèm bản văn bản thuần.

Khi deploy qua CLI, giữ ba file `index.ts`, `handler.ts`, `email-template.ts`. Khi deploy qua Dashboard, chạy `node scripts/build-order-email-function.mjs --dashboard` để xuất `index.ts` gộp phần handler, rồi thêm riêng file `email-template.ts` qua **Add File**. Nội dung HTML không nằm trong mã được xuất cho `index.ts`.

## Cấu hình

1. Tạo tài khoản Resend bằng `nghiabh.it@gmail.com`. Địa chỉ gửi thử `onboarding@resend.dev` chỉ gửi được đến email tài khoản Resend; muốn gửi đến danh sách khác cần xác minh tên miền gửi.
2. Trong Supabase **Edge Functions → Secrets**, thiết lập các biến trong `.env.example`. Tạo `ORDER_WEBHOOK_SECRET` ngẫu nhiên bằng `openssl rand -hex 32`. Không lưu key hoặc secret vào Git hay code phía trình duyệt.
3. Trong Dashboard **Edge Functions → resend-email → Code**, dán mã xuất từ script `--dashboard` vào file `index.ts`; thêm hoặc cập nhật file `email-template.ts` bằng nội dung file cùng tên trong repo, rồi chọn **Deploy updates**. Giữ thiết lập hiện có **Verify JWT with legacy secret: OFF**; handler kiểm tra secret riêng và từ chối yêu cầu thiếu hoặc sai `x-order-webhook-secret`. Bản local có `config.toml` tương ứng nếu sau này deploy bằng CLI.
4. Kiểm tra API key, địa chỉ gửi và danh sách nhận trong tài khoản Resend trước khi bật webhook.
5. Sau khi hoàn tất cấu hình email, vào **Integrations → Database Webhooks**. Nếu chưa cài, chọn **Install integration** để bật `pg_net` và các hàm webhook của Supabase. Tạo webhook cho bảng `public.orders`, chỉ chọn sự kiện **INSERT**. Dùng HTTP POST đến URL của function, kèm `Content-Type: application/json` và `x-order-webhook-secret` bằng `ORDER_WEBHOOK_SECRET`. Tạo trigger bằng SQL với `supabase_functions.http_request` và timeout `20000` ms để chờ được request Resend có timeout `15000` ms; form Dashboard hiện giới hạn timeout ở `10000` ms. Webhook bắt đầu chạy với các đơn mới ngay khi được lưu.
6. Khi có đơn thật, kiểm tra log của function, trạng thái email trong Resend và hộp thư người nhận. Phản hồi thành công chỉ xác nhận Resend đã nhận yêu cầu, không đảm bảo thư đã vào inbox.

SQL tạo webhook (thay hai placeholder bằng project ref và secret đã cấu hình; không lưu bản chứa secret vào Git):

```sql
create trigger notify_new_order_email
after insert on public.orders
for each row execute function supabase_functions.http_request(
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/resend-email',
  'POST',
  '{"Content-Type":"application/json","x-order-webhook-secret":"YOUR_ORDER_WEBHOOK_SECRET"}',
  '{}',
  '20000'
);
```

Kiểm tra cấu hình mà không gửi email: POST body `{}` không có secret phải trả `401`; cùng body với secret đúng phải trả `400`. Nếu trả `503`, kiểm tra các secrets còn thiếu trước khi thử payload email. Secret webhook có thể giữ trong `.env` ở gốc repo (đã gitignore) để dùng lại khi cấu hình header; không đưa giá trị này vào tài liệu hoặc test đã commit.

Function ghi log thành công/lỗi theo ID đơn và dùng idempotency key theo ID đơn để tránh email trùng trong thời hạn lưu key của Resend. Nếu gửi lỗi, đơn vẫn được lưu; kiểm tra log và gửi lại webhook cho cùng đơn. Phiên bản này chưa có hàng đợi tự động gửi lại.
