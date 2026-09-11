-- GỪNG DETOX — khởi tạo database Supabase
-- Theo tiem-gung-website-plan.md mục 8.3, 8.4, 8.5, 11.1
-- Chạy 1 lần trong Supabase Dashboard → SQL Editor → New query → dán toàn bộ file này → Run

-- ============================================================
-- BẢNG SẢN PHẨM (đồ uống lẻ, combo thuê bao, 5 Set Detox)
-- ============================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('single','combo','set')),
  name text not null,
  category text,
  description text,
  origin_story text,
  volume text,
  price_retail numeric,
  price numeric,
  servings int,
  delivery_schedule text,
  bottle_options text[],
  set_goal text,
  color_theme text,
  badge text check (badge in ('best-seller','new','sale','out-of-stock')),
  image_url text,
  video_url text,
  in_stock boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- BẢNG BÀI BLOG
-- ============================================================
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  body text not null,
  tag text,
  image_url text,
  video_url text,
  read_time text,
  published_at timestamptz default now()
);

-- ============================================================
-- BẢNG ĐƠN HÀNG
-- ============================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  customer_name text not null,
  address text not null,
  district text not null,
  items jsonb not null,
  bottle_type text not null check (bottle_type in ('glass','plastic')),
  bottles_returned int default 0,
  shipping_fee_note text default 'Phí ship tính theo khoảng cách, tiệm sẽ báo lại qua Zalo trước khi giao',
  status text not null default 'processing' check (status in ('processing','delivering','delivered','cancelled')),
  status_history jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ============================================================
-- BẬT ROW LEVEL SECURITY (RLS) — bắt buộc, nếu không bật thì
-- bất kỳ ai cũng đọc/sửa/xoá được toàn bộ dữ liệu
-- ============================================================
alter table products enable row level security;
alter table posts enable row level security;
alter table orders enable row level security;

-- products: ai cũng xem được (để hiện trang /san-pham),
-- chỉ chủ tiệm đã đăng nhập mới thêm/sửa/xoá được (qua /admin/san-pham)
create policy "Ai cũng xem được sản phẩm" on products for select using (true);
create policy "Admin thêm sản phẩm" on products for insert to authenticated with check (true);
create policy "Admin sửa sản phẩm" on products for update to authenticated using (true);
create policy "Admin xoá sản phẩm" on products for delete to authenticated using (true);

-- posts: tương tự sản phẩm
create policy "Ai cũng xem được bài viết" on posts for select using (true);
create policy "Admin thêm bài viết" on posts for insert to authenticated with check (true);
create policy "Admin sửa bài viết" on posts for update to authenticated using (true);
create policy "Admin xoá bài viết" on posts for delete to authenticated using (true);

-- orders: ai cũng đặt được (không cần đăng nhập) và tra cứu được (lọc theo đúng SĐT ở phía web),
-- chỉ chủ tiệm đã đăng nhập mới sửa trạng thái/xoá được (qua /admin/don-hang)
create policy "Ai cũng đặt được đơn" on orders for insert with check (true);
create policy "Ai cũng tra cứu được đơn" on orders for select using (true);
create policy "Admin cập nhật đơn hàng" on orders for update to authenticated using (true);
create policy "Admin xoá đơn hàng" on orders for delete to authenticated using (true);

-- ============================================================
-- KHO LƯU ẢNH (Storage buckets) cho trang admin upload ảnh
-- ============================================================
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);

create policy "Ai cũng xem được ảnh sản phẩm" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admin tải ảnh sản phẩm" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "Admin sửa ảnh sản phẩm" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "Admin xoá ảnh sản phẩm" on storage.objects for delete to authenticated using (bucket_id = 'product-images');

create policy "Ai cũng xem được ảnh blog" on storage.objects for select using (bucket_id = 'post-images');
create policy "Admin tải ảnh blog" on storage.objects for insert to authenticated with check (bucket_id = 'post-images');
create policy "Admin sửa ảnh blog" on storage.objects for update to authenticated using (bucket_id = 'post-images');
create policy "Admin xoá ảnh blog" on storage.objects for delete to authenticated using (bucket_id = 'post-images');
