// Thêm sản phẩm mới + cập nhật lịch giao combo Ginger Shot, dựa trên dữ liệu thật đọc
// được từ Google Form menu đặt hàng của tiệm (docs.google.com/forms/d/e/1FAIpQLSeJsjHtzU-aRMR4m5KMD4Mr_ZzUjCEjPF7cHY82FxfnLDg1CQ).
// Chạy 1 lần cục bộ: node --env-file=.env supabase/seed-menu-form-2026-09.mjs

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const newProducts = [
  // ---- Combo Sữa hạt (mẹ bầu) ----
  {
    slug: "combo-3-chai-sua-hat",
    type: "combo",
    name: "Combo 3 chai Sữa hạt",
    category: "sua-hat",
    description: "Giàu dinh dưỡng, dễ tiêu hóa, tốt cho tim mạch, tăng đề kháng — giá ưu đãi so với mua lẻ (giá gốc 237.000đ).",
    price: 209000,
    servings: 3,
    badge: "sale",
    image_url: "/images/products/combo-3-chai-sua-hat.webp",
    sort_order: 16,
  },
  {
    slug: "combo-5-chai-sua-hat",
    type: "combo",
    name: "Combo 5 chai Sữa hạt",
    category: "sua-hat",
    description: "Giàu dinh dưỡng, dễ tiêu hóa, tốt cho tim mạch, tăng đề kháng — giá ưu đãi so với mua lẻ (giá gốc 395.000đ).",
    price: 349000,
    servings: 5,
    badge: "sale",
    image_url: "/images/products/combo-5-chai-sua-hat.webp",
    sort_order: 17,
  },
  {
    slug: "combo-7-chai-sua-hat",
    type: "combo",
    name: "Combo 7 chai Sữa hạt",
    category: "sua-hat",
    description: "Giàu dinh dưỡng, dễ tiêu hóa, tốt cho tim mạch, tăng đề kháng — giá ưu đãi so với mua lẻ (giá gốc 553.000đ).",
    price: 469000,
    servings: 7,
    badge: "sale",
    image_url: "/images/products/combo-7-chai-sua-hat.webp",
    sort_order: 18,
  },

  // ---- Phô mai xông khói (dòng sản phẩm mới, không phải đồ uống) ----
  {
    slug: "pho-mai-xong-khoi",
    type: "single",
    name: "Phô Mai Xông Khói",
    category: "cheese",
    description: "Phô mai kéo sợi giòn dai, béo ngậy, xông khói tự nhiên kiểu Nga — 100% nguyên liệu tự nhiên, an toàn lành mạnh.",
    volume: "300g/gói",
    price_retail: 399000,
    badge: "new",
    image_url: null,
    sort_order: 19,
  },

  // ---- Trà gạo rang detox trái cây (dòng sản phẩm mới) ----
  {
    slug: "tra-gao-rang-detox-basic",
    type: "single",
    name: "Trà Gạo Rang Detox Trái Cây — Bản Basic",
    category: "tra-detox",
    description: "Cam sấy, táo sấy, gừng sấy, táo tàu, thanh quế — không kèm túi lọc gạo rang. Mỗi tối 1 gói, nhẹ bụng, dễ chịu hơn.",
    volume: "Hộp 12 gói",
    price_retail: 150000,
    badge: "new",
    image_url: null,
    sort_order: 20,
  },
  {
    slug: "tra-gao-rang-detox-premium",
    type: "single",
    name: "Trà Gạo Rang Detox Trái Cây — Bản Premium",
    category: "tra-detox",
    description: "Cam sấy, táo sấy, gừng sấy, táo tàu, thanh quế, kèm túi lọc gạo lứt rang giàu chất xơ, hỗ trợ tiêu hóa.",
    volume: "Hộp 12 gói",
    price_retail: 199000,
    badge: "new",
    image_url: null,
    sort_order: 21,
  },

  // ---- Hũ ngâm "Thứ 5" (giao riêng vào Thứ 5 hàng tuần, khác lịch Thứ 4/Thứ 6
  // của đồ uống tươi — xem mô tả) — "Củ Dền Gừng ngâm" đã có sẵn trong catalog,
  // đây là 2 vị còn lại từ hình ảnh thật trong form ----
  {
    slug: "chanh-vang-ngam-mat-ong",
    type: "single",
    name: "Chanh Vàng Ngâm Mật Ong",
    category: "hu-ngam",
    description: "Chanh vàng ngâm cùng mật ong nguyên chất — thơm nhẹ, thanh mát, tốt cho sức khỏe. Giao vào Thứ 5 hàng tuần (khác lịch Thứ 4/Thứ 6 của đồ uống tươi).",
    volume: "1 hũ",
    price_retail: null, // chờ chủ tiệm nhập giá qua /admin/san-pham
    image_url: null,
    sort_order: 22,
  },
  {
    slug: "thom-nuong-duong-phoi",
    type: "single",
    name: "Thơm Nướng Dưỡng Phổi",
    category: "hu-ngam",
    description: "Thơm (dứa) nướng cùng gừng và thanh quế — dưỡng phổi, thơm dịu nhẹ. Giao vào Thứ 5 hàng tuần (khác lịch Thứ 4/Thứ 6 của đồ uống tươi).",
    volume: "1 hũ",
    price_retail: null, // chờ chủ tiệm nhập giá qua /admin/san-pham
    image_url: null,
    sort_order: 23,
  },
];

const { data: inserted, error: insertError } = await supabase
  .from("products")
  .insert(newProducts)
  .select();

console.log(
  insertError
    ? "LOI insert products moi: " + insertError.message
    : `Da them ${inserted.length} san pham moi`
);

// Cập nhật lịch giao 2 combo Ginger Shot cho khớp thực tế: tiệm chỉ giao Thứ 4 &
// Thứ 6 hàng tuần (không có kiểu "4 đợt/tuần" như mô tả cũ).
const scheduleUpdates = [
  { slug: "combo-thang-ginger-shot", delivery_schedule: "2 đợt/tuần (Thứ 4 & Thứ 6)" },
  { slug: "combo-3-thang-ginger-shot", delivery_schedule: "Thứ 4 & Thứ 6 hàng tuần" },
];

for (const { slug, delivery_schedule } of scheduleUpdates) {
  const { error } = await supabase
    .from("products")
    .update({ delivery_schedule })
    .eq("slug", slug);
  console.log(
    error
      ? `LOI update ${slug}: ${error.message}`
      : `Da cap nhat delivery_schedule cho ${slug}`
  );
}
