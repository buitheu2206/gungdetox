-- Add the two halves of the four-month Ginger Shot journey without changing existing products.
-- Run in the GUNG project's Supabase SQL Editor, then rebuild for the new detail pages.
insert into products (
  slug, type, name, category, description, volume, price, servings,
  delivery_schedule, bottle_options, image_url, sort_order
)
values
  (
    'combo-2-thang-dau-ginger-shot', 'combo',
    'Combo 2 tháng đầu Ginger Shot — Cam + Xanh', 'ginger-shot',
    '56 chai: tháng 1 gồm 28 chai Cam, tháng 2 gồm 28 chai Xanh. Mỗi ngày 1 shot. Làm quen — thanh lọc — xây nền sức khỏe.',
    '30ml/lần', 1100000, 56, 'hàng tuần', array['glass', 'plastic'],
    '/images/products/combo-2-thang-dau-ginger-shot.png', 11
  ),
  (
    'combo-2-thang-sau-ginger-shot', 'combo',
    'Combo 2 tháng sau Ginger Shot — Đỏ + Thơm', 'ginger-shot',
    '56 chai: tháng 3 gồm 28 chai Đỏ, tháng 4 gồm 28 chai Thơm. Mỗi ngày 1 shot. Hướng vóc dáng — cân bằng — duy trì.',
    '30ml/lần', 1100000, 56, 'hàng tuần', array['glass', 'plastic'],
    '/images/products/combo-2-thang-sau-ginger-shot.png', 12
  )
on conflict (slug) do nothing;
