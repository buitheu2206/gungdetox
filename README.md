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
├── dat-hang.astro           Đặt hàng (5 bước) + tra cứu bằng mã đơn hoặc SĐT
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
không gọi được từ script client-side. CSS dùng chung nằm ở `src/styles/cards.css`.
Các component card tham chiếu không còn được giữ thành bản sao trong source.

## Supabase

3 bảng chính: `products` (type `single|combo|set`), `posts`, `orders`. Schema ở
`supabase/schema.sql` — chạy 1 lần trong Supabase SQL Editor. Đăng nhập admin dùng
Supabase Auth (email/password), gác cổng ở `src/components/AdminLogin.astro`.

Đơn mới lưu `unitPrice` trong từng phần tử `orders.items` (JSONB), không cần đổi schema.
Bảng quản trị và CSV ưu tiên giá này để tính thành tiền, chưa gồm phí ship. Đơn cũ
thiếu giá dùng giá sản phẩm hiện tại để hiển thị, không ghi ngược vào DB; giá này có
thể khác giá lúc đặt. Sản phẩm đã xoá hoặc chưa có giá vẫn hiển thị “—”. Tên sản phẩm
được lấy từ bảng `products`; nếu không tìm thấy thì giữ mã sản phẩm. Giá được chụp
từ bảng sản phẩm trong RPC; tiệm vẫn cần xác nhận trước khi thu tiền.

RLS: public chỉ đọc sản phẩm/bài viết; mọi thao tác quản trị yêu cầu UUID có trong
`admin_users`. Khách tạo đơn qua `create_order_with_receipt` và tra cứu bằng **mã đơn hoặc SĐT**
qua `lookup_order`; không được đọc bảng `orders` trực tiếp. Trang chi tiết đơn và ảnh
chuyển khoản chỉ dành cho admin. Giá đơn mới được chụp từ DB ở RPC.

Thứ tự bootstrap, migration và test quyền nằm ở [supabase/README.md](supabase/README.md).
Dựng mới theo đủ thứ tự trong hướng dẫn, đến `migrations/20261019110000_order_lookup_newest_first.sql`; project đang chạy chỉ áp dụng migration còn thiếu. Tra cứu trả mảng tối đa 20 đơn mới nhất, cung cấp cả mã và SĐT sẽ thu hẹp kết quả.
Đơn mới lưu ngày/giờ/ghi chú vào các cột riêng;
đơn cũ vẫn đọc được qua parser legacy.

URL `/don-hang/{order_code}` được rewrite về `don-hang/index.html` bởi `public/.htaccess`
trên hosting Apache/LiteSpeed có bật `mod_rewrite`; `src/middleware.ts` xử lý tương tự khi dev.
Nếu hosting đã có `.htaccess` riêng, gộp block rewrite của đơn hàng vào cấu hình đó trước
khi deploy để giữ các quy tắc hiện có. Nút email mới cần deploy lại function `resend-email`.

### Ảnh chuyển khoản

Chạy migration `supabase/payment-receipts.sql` sau schema và sau khi tạo ba tài khoản quản trị.
Bucket `payment-receipts` là private, nhận JPG/PNG/WebP tối đa 5 MB. Khách gửi một ảnh trước
khi tạo đơn; nội dung `WEB {order_code}` được điền vào QR, hiển thị và có nút sao chép. Ảnh chỉ là
bằng chứng để tiệm đối chiếu, không tự đánh dấu `paid`.

Quản trị tích ô `Đã thanh toán` trong chi tiết đơn hoặc bảng đơn sau khi đối chiếu tiền nhận.
Bỏ tích để sửa xác nhận nhầm; chỉ cập nhật `paid`, không đổi trạng thái hay lịch sử giao hàng.

Nút `Tiếp tục` ở bước 4 kiểm tra lại `in_stock = true`, sinh một UUID trên trình duyệt và mở bước 5 —
màn thanh toán. Đơn **chưa được ghi vào DB** ở bước này; mã đơn/QR hiển thị được vì đã tính
trước từ UUID đó. Nút `Quay lại` ở bước 5 về đúng bước 4, mọi trường vẫn giữ nguyên dữ liệu
và vẫn sửa được — không có gì để dọn vì chưa có đơn nào được tạo. Quay lại bước 5 lần nữa
dùng lại đúng UUID cũ nên mã đơn không đổi.

Nút cuối `Xác nhận đặt hàng` upload ảnh lên Storage theo đường dẫn `{order_id}/receipt-{sha256}`, sau
đó gọi RPC `create_order_with_receipt(order_data, order_id)` — RPC này **bắt buộc ảnh đã có
sẵn trong Storage** mới cho tạo đơn, và tạo đơn với `payment_receipt_submitted_at` được set
ngay lập tức (không còn bước xác nhận riêng). Gọi lại khi mất response là an toàn: RPC tạo
đơn theo kiểu idempotent, chỉ trả mã định danh và đường dẫn ảnh thay vì thông tin cá nhân. Webhook email
cấu hình trên trigger INSERT của `orders`, không cần điều kiện — mọi đơn vừa insert đều đã
có ảnh xác nhận. Sau khi xác nhận thành công, màn hình hiển thị lời cảm ơn và thông báo tiệm
sẽ liên hệ xác nhận đơn hàng; hai nút hành động được thay bằng `Về trang chủ`.

Bucket `payment-receipts` private, chỉ nhận JPG/PNG/WebP tối đa 5 MB; policy insert chỉ kiểm
tra đường dẫn đúng định dạng `{uuid}/receipt-{sha256}` (vẫn hỗ trợ `{uuid}/receipt` cho client cũ), không cần bảng quyền riêng (khác bản trước đây
dùng `order_receipt_uploads` — bảng này đã bị xoá). Ba quản trị hiện tại xem ảnh trong trang
chi tiết đơn qua signed URL có hiệu lực một giờ. Nếu rời trang trước khi upload, không có gì
phát sinh trong DB; nếu upload thành công nhưng mất response ở bước tạo đơn, bấm lại
`Xác nhận đặt hàng` để thử lại an toàn. Đổi trạng thái ở cả hai màn quản trị dùng chung luồng
ghi lịch sử. Nếu ảnh đã upload nhưng tạo đơn chưa thành công, khách vẫn được chọn ảnh khác:
ảnh mới có đường dẫn khác, mã chuyển khoản giữ nguyên và đơn lưu đường dẫn ảnh được xác nhận.
Trang quản trị đọc đường dẫn này thay vì lấy ảnh đầu tiên trong thư mục. Nếu đơn thực tế đã
được tạo nhưng response bị mất, hệ thống không đổi ảnh của đơn đó khi khách thử gửi ảnh mới.
Ảnh upload chưa gắn vào đơn có thể còn lại trong Storage; thay đổi này không tự xoá chúng.

Áp dụng `supabase/migrations/20261020021257_version_payment_receipts.sql` trước khi deploy
frontend mới. RPC tạo đơn vẫn public; danh sách, chi tiết đầy đủ và ảnh biên lai yêu cầu quyền admin.

Kiểm tra toàn bộ luồng (RPC, storage policy, thời điểm email) bằng
`supabase/tests/defer-order-until-payment.sql`; dữ liệu và hàng đợi pg_net đều được rollback,
không gửi email thật trong quá trình kiểm tra.
`tests/checkout-integration.test.mjs` nối helper checkout, Storage adapter, SQL/RLS, hàng đợi webhook
và handler email thật trong PGlite; HTTP đến Resend được giả lập, không gửi email ra ngoài.

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

## Kiểm tra trước deploy

Migration database chạy thủ công bằng Supabase CLI hoặc MCP theo
[hướng dẫn migration](supabase/README.md#manual-migrations-cli-or-mcp).
Không có workflow GitHub Actions cho migration; workflow email vẫn deploy riêng.
Kiểm tra lịch sử trước khi áp dụng SQL trong `supabase/migrations/`, không chạy lại toàn bộ bootstrap.

`npm run check` chạy ESLint, Astro typecheck và unit test; `npm run build` kiểm tra build tĩnh.
CI website chạy các bước này trước upload. Deno entrypoint được kiểm tra trong môi trường
Supabase; Astro typecheck chỉ kiểm tra mã dùng chung và handler, không giả lập Deno runtime.

Kiểm tra gallery trong trình duyệt local: chạy dev server, rồi gọi
`(await import('/tests/gallery.browser.mjs')).runGalleryTests()` trong console.
Fixture không gọi Supabase. Các script `.verify` là kiểm tra thủ công lịch sử, có script ghi dữ liệu;
không chạy chúng hàng loạt hoặc dùng tài khoản production để kiểm thử.
