# GỪNG DETOX

Website bán hàng cho tiệm đồ uống detox GỪNG DETOX (Sài Gòn) — đồ uống lẻ, combo thuê bao,
5 Set Detox, đặt hàng + tra cứu đơn, blog, trang nhượng quyền/khóa học.

Astro build ra site **tĩnh** (HTML/CSS/JS thuần), mọi phần "động" (sản phẩm, blog, đặt hàng,
tra cứu đơn, quản trị) gọi thẳng **Supabase** từ trình duyệt — không có server Node.js riêng.

## Cấu trúc trang

```
src/pages/
├── index.astro              Trang chủ
├── san-pham.astro           Danh sách sản phẩm (lẻ / combo / 5 Set Detox)
├── san-pham/[slug].astro    Chi tiết 1 sản phẩm
├── dat-hang.astro           Đặt hàng (4 bước) + tra cứu đơn theo SĐT
├── don-hang.astro           Chi tiết /don-hang/{order_code}, yêu cầu đăng nhập quản trị
├── blog.astro, blog/[slug].astro
├── khoa-hoc.astro           Nhượng quyền / chuyển giao công thức
├── lien-he.astro
├── chinh-sach/*.astro       Đổi trả chai, giao hàng, thanh toán
└── admin/
    ├── san-pham.astro       CRUD sản phẩm (ảnh upload qua Supabase Storage)
    ├── blog.astro           CRUD bài blog (rich-text Quill)
    └── don-hang.astro       Danh sách đơn, đổi trạng thái, xuất CSV
```

Dữ liệu động (danh sách sản phẩm/bài blog hiện trên card) được dựng bằng các hàm HTML string
trong `src/lib/templates.ts` thay vì import thẳng component `.astro` — vì component `.astro`
không gọi được từ script client-side. Các file `src/components/ProductCard.astro`,
`ComboCard.astro`, `SetDetoxCard.astro` chỉ giữ lại để tham chiếu cấu trúc props/markup,
không trang nào import trực tiếp; CSS thật nằm ở `src/styles/cards.css`.

## Supabase

3 bảng chính: `products` (type `single|combo|set`), `posts`, `orders`. Schema ở
`supabase/schema.sql` — chạy 1 lần trong Supabase SQL Editor. Đăng nhập admin dùng
Supabase Auth (email/password), gác cổng ở `src/components/AdminLogin.astro`.

Đơn mới lưu `unitPrice` trong từng phần tử `orders.items` (JSONB), không cần đổi schema.
Bảng quản trị và CSV ưu tiên giá này để tính thành tiền, chưa gồm phí ship. Đơn cũ
thiếu giá dùng giá sản phẩm hiện tại để hiển thị, không ghi ngược vào DB; giá này có
thể khác giá lúc đặt. Sản phẩm đã xoá hoặc chưa có giá vẫn hiển thị “—”. Tên sản phẩm
được lấy từ bảng `products`; nếu không tìm thấy thì giữ mã sản phẩm. Giá được chụp
từ checkout phía trình duyệt; tiệm vẫn cần xác nhận trước khi thu tiền.

RLS: ai cũng đọc được `products`/`posts`/`orders` (để trang public hiện được), chỉ tài khoản
`authenticated` mới ghi/sửa/xoá.

Trang chi tiết đơn xác minh phiên đăng nhập trước khi truy vấn và không đưa dữ liệu khách vào
HTML build hoặc sitemap. Đây là kiểm soát giao diện; policy SELECT công khai của `orders`
hiện vẫn cho phép đọc qua API. Cần thiết kế lại API tra cứu khách trước khi siết policy này
để tránh làm hỏng tra cứu theo SĐT và bước đặt hàng đang dùng `.insert().select()`.

URL `/don-hang/{order_code}` được rewrite về `don-hang/index.html` bởi `public/.htaccess`
trên hosting Apache/LiteSpeed có bật `mod_rewrite`; `src/middleware.ts` xử lý tương tự khi dev.
Nếu hosting đã có `.htaccess` riêng, gộp block rewrite của đơn hàng vào cấu hình đó trước
khi deploy để giữ các quy tắc hiện có. Nút email mới cần deploy lại function `resend-email`.

### Ảnh chuyển khoản

Chạy migration `supabase/payment-receipts.sql` sau schema và sau khi tạo ba tài khoản quản trị.
Bucket `payment-receipts` là private, nhận JPG/PNG/WebP tối đa 5 MB. Khách gửi một ảnh sau
khi tạo đơn; mã đơn được điền vào QR và có nút sao chép nội dung chuyển khoản. Ảnh chỉ là
bằng chứng để tiệm đối chiếu, không tự đánh dấu `paid`.

Quản trị tích ô `Đã thanh toán` trong chi tiết đơn hoặc bảng đơn sau khi đối chiếu tiền nhận.
Bỏ tích để sửa xác nhận nhầm; chỉ cập nhật `paid`, không đổi trạng thái hay lịch sử giao hàng.

Nút `Tiếp tục` tạo đơn chờ thanh toán và mở bước chuyển khoản. Nút cuối `Xác nhận chuyển
khoản` lưu ảnh rồi gọi RPC `confirm_payment_receipt`. Chạy thêm migration
`supabase/payment-receipt-confirmation.sql` để ghi `payment_receipt_submitted_at` và chuyển
webhook email từ tạo đơn sang lần xác nhận ảnh đầu tiên. Migration giữ endpoint/secret
của trigger cũ, tắt trigger INSERT và tạo trigger UPDATE có điều kiện. Gửi lại xác nhận
không kích hoạt email lần nữa; lỗi xác nhận sau khi ảnh đã lưu có thể thử lại.

Checkout tạo đơn qua RPC `create_order_with_receipt`, đồng thời cấp quyền upload bằng UUID
ngẫu nhiên do trình duyệt tạo. Quyền này lưu ở bảng `order_receipt_uploads` không cho client
đọc trực tiếp; tách khỏi `orders` vì bảng đơn hiện có SELECT công khai. File dùng đường dẫn
`{order_id}/{upload_token}`, không cho khách đọc, ghi đè hoặc xóa ảnh. Ba quản trị hiện tại
xem ảnh trong trang chi tiết đơn qua signed URL có hiệu lực một giờ.
Nếu upload lỗi, khách có thể gửi lại tại trang cảm ơn; nếu rời trang trước khi gửi, liên hệ
tiệm kèm mã đơn. Đổi trạng thái ở cả hai màn quản trị dùng chung luồng ghi lịch sử.

Kiểm tra quyền bằng `supabase/tests/payment-receipts.sql`; dữ liệu kiểm tra được rollback.
Kiểm tra thời điểm email bằng `supabase/tests/payment-receipt-confirmation.sql`; cả dữ liệu
và hàng đợi pg_net được rollback, không gửi email thật trong quá trình kiểm tra.

## Cài đặt & chạy local

```sh
npm install
```

Tạo file `.env` ở gốc repo (không commit, đã gitignore):

```
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx   # chỉ cần khi chạy script seed, không dùng trong code chạy ở trình duyệt
```

Chạy dev server:

```sh
astro dev --background       # chạy nền, dùng astro dev stop/status/logs để quản lý
```

## Build & deploy

Site host trên **Web Hosting iNET** (shared hosting, FTP), domain `gungdetox.com`.

**Tự động (khuyên dùng):** push lên nhánh `main` → GitHub Actions
(`.github/workflows/deploy.yml`) tự build + upload `dist/` qua FTP. Cần tạo 5 repo secret:
`FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`.

Mẫu email có workflow riêng `.github/workflows/deploy-order-email.yml`: sửa HTML hoặc mã function
rồi push lên `main` sẽ tự tạo mẫu, chạy tests và deploy `resend-email` lên Supabase. Cấu hình thêm
hai repo secret `SUPABASE_ACCESS_TOKEN` và `SUPABASE_PROJECT_REF` một lần; xem hướng dẫn trong
[`supabase/functions/resend-email/README.md`](supabase/functions/resend-email/README.md#deploy-tự-động).

**Thủ công:** cần file `.env.production` (không có trong repo, xin riêng chủ dự án) chứa
`FTP_HOST`, `FTP_USER`, `FTP_PASS`, rồi chạy:

```sh
npm run deploy    # = astro build + upload dist/ qua FTP (scripts/deploy.mjs)
```

Kiểm tra lại sau khi deploy: `/`, `/dat-hang/`, `/san-pham/`.

## Lệnh khác

| Lệnh | Việc |
| :-- | :-- |
| `npm run build` | Build ra `dist/` |
| `npm run preview` | Xem thử bản build local |
| `node --env-file=.env supabase/seed.mjs` | Seed dữ liệu demo (cần `SUPABASE_SERVICE_ROLE_KEY`) |

## Tài liệu thêm

`tiem-gung-website-plan.md` — toàn bộ yêu cầu/kế hoạch gốc, nguồn tham chiếu cho mọi quyết
định thiết kế/kỹ thuật trong code (comment trong code hay trỏ về mục số trong file này).
