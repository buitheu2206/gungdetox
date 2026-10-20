# Thông báo đơn hàng nội bộ

Function nhận webhook `UPDATE` của `public.orders` sau khi khách lưu ảnh và xác nhận chuyển khoản. Chỉ gửi khi `payment_receipt_submitted_at` chuyển từ null sang một thời điểm xác nhận; tạo đơn, đổi trạng thái giao hàng và xác nhận lại không gửi email. Danh sách nhận được cấu hình riêng, không lấy từ tài khoản quản trị hoặc dữ liệu khách hàng. Email thông báo ngắn gọn có đơn hàng mới, không xác nhận khách đã thanh toán.

## Mẫu email HTML

Sửa `email-template.html`; toàn bộ CSS nằm trong file này (inline cho khả năng tương thích email và `<style>` cho màn hình nhỏ). Mẫu gồm thông báo, tên khách, số điện thoại, sản phẩm/số lượng, địa chỉ và thời điểm khách chọn nhận hàng. Thời điểm nhận hàng được trích từ `shipping_fee_note` theo định dạng hiện có của trang đặt hàng; đơn cũ thiếu thông tin sẽ hiển thị rõ. Sản phẩm hiển thị bằng `productSlug` được lưu trong đơn, giống bảng quản trị.

Sau khi sửa mẫu, chạy `node scripts/build-order-email-function.mjs` từ thư mục gốc repo để cập nhật `email-template.ts`. File này chứa HTML dễ đọc dưới dạng template literal; `index.ts` chỉ import mẫu, không nhúng HTML. Dashboard không đóng gói file HTML tĩnh, nên dùng module riêng để giữ mẫu tách khỏi handler mà không cần đọc file ở runtime. Dữ liệu động được escape trước khi đưa vào HTML; email cũng kèm bản văn bản thuần.

## Deploy tự động

Workflow `.github/workflows/deploy-order-email.yml` chạy khi push thay đổi mẫu HTML, mã function,
script tạo mẫu, cấu hình function hoặc tests email lên `main`. Workflow tự tạo `email-template.ts`
từ HTML, chạy tests rồi deploy riêng `resend-email`. Có thể chạy lại bằng **Actions → Deploy order email → Run workflow** trên `main`.

Cấu hình một lần trong **GitHub → Settings → Secrets and variables → Actions → Repository secrets**:

- `SUPABASE_ACCESS_TOKEN`: personal access token tạo tại https://supabase.com/dashboard/account/tokens;
  đây là token deploy, không phải anon key, service role key hay Resend API key. Token này cần
  quyền `edge_functions_write`, nếu thiếu workflow sẽ báo lỗi `Missing required permission(s): edge_functions_write`.
- `SUPABASE_PROJECT_REF`: project ref hiện tại `bjenawwpxwivocsmsmzd`.

Sau đó chỉ sửa `email-template.html` rồi commit/push lên `main`; không cần chạy script tạo mẫu
hoặc sửa code trên Dashboard bằng tay. Tiêu đề email và bản văn bản thuần vẫn nằm trong `handler.ts`.
Secrets gửi email đã thiết lập trên Supabase được giữ nguyên; workflow dùng `verify_jwt = false`
trong `config.toml`, với secret webhook được kiểm tra bởi handler. Workflow không gửi email thử.

Khi deploy qua CLI, giữ ba file `index.ts`, `handler.ts`, `email-template.ts`. Khi deploy qua Dashboard, chạy `node scripts/build-order-email-function.mjs --dashboard` để xuất `index.ts` gộp phần handler, rồi thêm riêng file `email-template.ts` qua **Add File**. Nội dung HTML không nằm trong mã được xuất cho `index.ts`.

## Cấu hình

1. Tạo tài khoản Resend bằng `nghiabh.it@gmail.com`. Địa chỉ gửi thử `onboarding@resend.dev` chỉ gửi được đến email tài khoản Resend; muốn gửi đến danh sách khác cần xác minh tên miền gửi.
2. Trong Supabase **Edge Functions → Secrets**, thiết lập các biến trong `.env.example`. Tạo `ORDER_WEBHOOK_SECRET` ngẫu nhiên bằng `openssl rand -hex 32`. Không lưu key hoặc secret vào Git hay code phía trình duyệt.
3. Trong Dashboard **Edge Functions → resend-email → Code**, dán mã xuất từ script `--dashboard` vào file `index.ts`; thêm hoặc cập nhật file `email-template.ts` bằng nội dung file cùng tên trong repo, rồi chọn **Deploy updates**. Giữ thiết lập hiện có **Verify JWT with legacy secret: OFF**; handler kiểm tra secret riêng và từ chối yêu cầu thiếu hoặc sai `x-order-webhook-secret`. Bản local có `config.toml` tương ứng nếu sau này deploy bằng CLI.
4. Kiểm tra API key, địa chỉ gửi và danh sách nhận trong tài khoản Resend trước khi bật webhook.
5. Sau khi hoàn tất cấu hình email, bật tích hợp **Database Webhooks** nếu chưa có. Với project mới, tạo trigger gốc bằng SQL bên dưới để lưu endpoint và secret, rồi chạy `supabase/payment-receipts.sql` và `supabase/payment-receipt-confirmation.sql`. Với project đã có trigger `notify_new_order_email` và bucket ảnh, chỉ chạy migration xác nhận. Migration tắt trigger INSERT và tạo `notify_order_receipt_email` cho UPDATE với điều kiện chỉ gửi sau lần xác nhận ảnh đầu tiên. Timeout giữ ở `20000` ms để chờ request Resend có timeout `15000` ms.
6. Khi có đơn thật, kiểm tra log của function, trạng thái email trong Resend và hộp thư người nhận. Phản hồi thành công chỉ xác nhận Resend đã nhận yêu cầu, không đảm bảo thư đã vào inbox.

SQL cấu hình trigger gốc cho project mới (migration xác nhận sẽ chuyển nó sang UPDATE; function hiện bỏ qua INSERT). Thay hai placeholder bằng project ref và secret đã cấu hình; không lưu bản chứa secret vào Git:

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

Function ghi log thành công/lỗi theo ID đơn và dùng idempotency key `order-receipt-notification/{order_id}` để tránh email trùng trong thời hạn lưu key của Resend. Nếu gửi lỗi, đơn và ảnh vẫn được lưu; kiểm tra log và gửi lại webhook UPDATE cho cùng lần xác nhận (record có thời điểm xác nhận, old_record có thời điểm null). Phiên bản này chưa có hàng đợi tự động gửi lại. Chạy `supabase/tests/payment-receipt-confirmation.sql` để kiểm tra tạo đơn không gửi, xác nhận có ảnh gửi một lần và đổi trạng thái không gửi thêm; dữ liệu và hàng đợi được rollback.
