// Thêm 5 Set quà tặng tri ân "Yêu Mẹ / Thân Thương / Chăm Mẹ Bầu / Healthy 1 Tuần / Yêu Cấp Tốc",
// dựa trên bài đăng Facebook + bảng "05 SET QUÀ GỪNG DETOX" (thành phần cụ thể từng set)
// chủ tiệm gửi 12/09/2026. Script này chỉ chạy 1 lần — đã áp dụng lên Supabase, giữ lại làm
// tài liệu tham chiếu (không re-run được vì các slug đã tồn tại).
// node --env-file=.env supabase/seed-qua-tang-2026-09.mjs

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const newProducts = [
  {
    slug: "set-qua-yeu-me",
    type: "combo",
    name: "Set Quà \"Yêu Mẹ\"",
    category: "qua-tang",
    description: "Gồm 7 chai Ginger Shot + 6 lon Bia Gừng + 6 chai Kombucha. Một chút yêu thương gửi đến mẹ — mong mẹ luôn khỏe, luôn vui và có những ngày thật nhẹ nhàng. Tặng kèm túi quà GỪNG DETOX, có thể viết thiệp gửi lời yêu thương.",
    price: 599000,
    badge: "new",
    image_url: null,
    sort_order: 24,
  },
  {
    slug: "set-qua-than-thuong",
    type: "combo",
    name: "Set Quà \"Thân Thương\"",
    category: "qua-tang",
    description: "Gồm 7 chai Ginger Shot + 6 lon Bia Gừng + 6 chai Kombucha + 1 ngày Detox 5 chai. Tặng một người mình thương, không cần dịp đặc biệt — chỉ cần hôm nay bạn chợt nhớ đến họ. Tặng kèm túi quà GỪNG DETOX, có thể viết thiệp gửi lời yêu thương.",
    price: 790000,
    badge: "new",
    image_url: null,
    sort_order: 25,
  },
  {
    slug: "set-qua-cham-me-bau",
    type: "combo",
    name: "Set Quà \"Chăm Mẹ Bầu\"",
    category: "qua-tang",
    description: "Gồm 10 gói Smoothies – Sữa hạt + 6 lon Bia Gừng + 6 chai Kombucha + 1 chai Juice. Gửi đến mẹ bầu một chút chăm sóc trong hành trình đặc biệt — mẹ khỏe, vui và được yêu thương cũng là điều em bé cảm nhận được. Tặng kèm túi quà GỪNG DETOX.",
    price: 979000,
    badge: "new",
    image_url: null,
    sort_order: 26,
  },
  {
    slug: "set-qua-healthy-1-tuan",
    type: "combo",
    name: "Set Quà \"Healthy 1 Tuần\"",
    category: "qua-tang",
    description: "Gồm 7 chai Ginger Shot + 6 lon Bia Gừng + 6 chai Kombucha + 3 ngày Detox 15 chai. Bắt đầu 1 tuần sống healthy trọn vẹn — đủ đầy từ Ginger Shot, Bia Gừng, Kombucha đến Detox thanh lọc. Tặng kèm túi quà GỪNG DETOX.",
    price: 1200000,
    badge: "new",
    image_url: null,
    sort_order: 27,
  },
  {
    slug: "set-qua-yeu-cap-toc",
    type: "combo",
    name: "Set Quà \"Yêu Cấp Tốc\"",
    category: "qua-tang",
    description: "Gồm 7 chai Ginger Shot + 6 lon Bia Gừng + 6 chai Kombucha + 7 ngày Detox 35 chai. Dành cho người muốn bắt đầu nghiêm túc hơn với sức khỏe và lối sống healthy — một tuần uống lành, một tuần yêu cơ thể nhiều hơn. Tặng kèm túi quà GỪNG DETOX.",
    price: 2190000,
    badge: "new",
    image_url: null,
    sort_order: 28,
  },
];

const { data: inserted, error } = await supabase
  .from("products")
  .insert(newProducts)
  .select();

console.log(
  error ? "LOI insert set qua tang: " + error.message : `Da them ${inserted.length} set qua tang`
);
