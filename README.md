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

RLS: ai cũng đọc được `products`/`posts`/`orders` (để trang public hiện được), chỉ tài khoản
`authenticated` mới ghi/sửa/xoá.

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
