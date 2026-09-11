// Seed dữ liệu demo cho products + posts (mục 9.1, 6.2.1, 6.5.1 trong plan)
// Chạy 1 lần cục bộ: node --env-file=.env supabase/seed.mjs
// Dùng service_role key vì cần bỏ qua RLS (insert hàng loạt lúc chưa có phiên admin).

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const products = [
  // ---- Đồ uống lẻ (type: single) ----
  {
    slug: "ginger-shot",
    type: "single",
    name: "Ginger Shot",
    category: "ginger-shot",
    description: "Gừng tươi + nghệ + chanh vàng + mật ong + muối hồng",
    volume: "30ml/lần",
    price_retail: null,
    badge: "best-seller",
    image_url: "/images/products/ginger-shot.webp",
    sort_order: 1,
  },
  {
    slug: "bia-gung",
    type: "single",
    name: "Bia Gừng (Ginger Beer)",
    category: "bia-gung",
    description: "Gừng tươi + chanh + đường mía, lên men tự nhiên, không cồn",
    volume: "1 lon",
    price_retail: 49000,
    image_url: "/images/products/bia-gung.webp",
    sort_order: 2,
  },
  {
    slug: "juice-ep-tuoi",
    type: "single",
    name: "Juice ép tươi",
    category: "juice",
    description: "21 vị (J1-J21), chia 3 nhóm theo mục tiêu sức khỏe",
    volume: "1 chai",
    price_retail: 69000,
    image_url: "/images/products/juice-ep-tuoi.webp",
    sort_order: 3,
  },
  {
    slug: "smoothies-dong-lanh",
    type: "single",
    name: "Smoothies đông lạnh",
    category: "smoothie",
    description: "18-20 vị, chỉ cần thêm nước/sữa hạt rồi xay",
    volume: "1 gói",
    price_retail: 49000,
    image_url: "/images/products/smoothies-dong-lanh.webp",
    sort_order: 4,
  },
  {
    slug: "sua-hat-tuoi",
    type: "single",
    name: "Sữa hạt tươi",
    category: "sua-hat",
    description:
      "Hạnh nhân/óc chó/macca/hạt điều/hạt sen/yến mạch, nấu mới sau khi đặt",
    volume: "1 chai",
    price_retail: 79000,
    sort_order: 5, // chưa có ảnh thật phù hợp — chờ bổ sung qua /admin/san-pham
  },
  {
    slug: "kombucha",
    type: "single",
    name: "Kombucha",
    category: "kombucha",
    description: "Lên men trà tự nhiên với SCOBY, đủ vị",
    volume: "1 lon",
    price_retail: null, // chờ chủ tiệm nhập giá lẻ từng vị qua /admin/san-pham
    image_url: "/images/products/kombucha.webp",
    sort_order: 6,
  },
  {
    slug: "cu-den-gung-ngam",
    type: "single",
    name: "Củ Dền Gừng ngâm",
    category: "cu-den",
    description: "Hũ dùng cho cả gia đình, phù hợp làm quà biếu",
    volume: "1 hũ",
    price_retail: 199000,
    image_url: "/images/products/cu-den-gung-ngam.webp",
    sort_order: 7,
  },
  {
    slug: "coco-matcha",
    type: "single",
    name: "Coco Matcha",
    category: "matcha",
    description: "Matcha đậm vị, béo ngậy từ coco — dòng Matcha mới ra mắt",
    volume: "1 chai",
    price_retail: 79000,
    badge: "new",
    sort_order: 8, // chưa có ảnh thật phù hợp — chờ bổ sung qua /admin/san-pham
  },

  // ---- Combo thuê bao (type: combo) ----
  {
    slug: "combo-thang-ginger-shot",
    type: "combo",
    name: "Combo tháng Ginger Shot",
    category: "ginger-shot",
    description: "28 lần uống (30ml/lần), giao 4 đợt/tuần",
    price: 550000,
    servings: 28,
    delivery_schedule: "4 đợt/tuần",
    bottle_options: ["glass", "plastic"],
    badge: "best-seller",
    sort_order: 9,
  },
  {
    slug: "combo-3-thang-ginger-shot",
    type: "combo",
    name: "Combo 3 tháng Ginger Shot",
    category: "ginger-shot",
    description: "84 lần uống, giao theo tuần để đảm bảo độ tươi ngon",
    price: 1500000,
    servings: 84,
    delivery_schedule: "Giao theo tuần",
    bottle_options: ["glass", "plastic"],
    sort_order: 10,
  },

  // ---- 5 SET DETOX TỰ NHIÊN (type: set) — mục 6.2.1 ----
  {
    slug: "set-1-xanh-thanh-loc",
    type: "set",
    name: "Set 1 — Xanh Thanh Lọc",
    category: "set-detox",
    set_goal: "Thải độc – Làm mát – Giảm đầy bụng",
    price: 160000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "green",
    sort_order: 11,
  },
  {
    slug: "set-2-ginger-thom-tai-tao",
    type: "set",
    name: "Set 2 — Ginger Thơm Tái Tạo",
    category: "set-detox",
    set_goal: "Tăng đề kháng – Bổ sung vitamin – Đẹp da",
    price: 160000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "yellow",
    badge: "best-seller",
    sort_order: 12,
  },
  {
    slug: "set-3-do-giam-can",
    type: "set",
    name: "Set 3 — Đỏ Giảm Cân",
    category: "set-detox",
    set_goal: "Đốt mỡ – Hỗ trợ tiêu hóa – Giảm mỡ bụng",
    price: 170000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "red",
    sort_order: 13,
  },
  {
    slug: "set-4-ginger-cam-tieu-hoa-tot",
    type: "set",
    name: "Set 4 — Ginger Cam Tiêu Hóa Tốt",
    category: "set-detox",
    set_goal: "Hỗ trợ tiêu hóa – Giảm đầy hơi – Dịu dạ dày",
    price: 160000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "orange",
    sort_order: 14,
  },
  {
    slug: "set-5-mix-can-bang",
    type: "set",
    name: "Set 5 — Mix Cân Bằng",
    category: "set-detox",
    set_goal: "Cân bằng dinh dưỡng – Detox toàn diện",
    price: 160000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "mix",
    sort_order: 15,
  },
];

const posts = [
  {
    slug: "uong-nuoc-ep-cu-den-dung-cach",
    title: "Uống nước ép củ dền đúng cách để cơ thể hấp thu tốt hơn",
    tag: "eat-clean",
    read_time: "3 phút",
    body: `Nhiều người nghĩ nước ép củ dền càng uống nhiều càng tốt. Thực ra, uống đúng cách mới là điều quan trọng.

🌱 Nếu mới bắt đầu uống: chỉ nên uống một lượng nhỏ để cơ thể làm quen, có thể kết hợp với chanh, táo hoặc gừng để hương vị dễ uống hơn và giảm cảm giác khó chịu.

🥤 Mỗi lần uống: không nên uống quá 250ml.

📅 Tần suất: chỉ nên uống 1-2 lần/tuần. Không nên uống mỗi ngày vì hàm lượng nitrat tự nhiên cao có thể khiến một số người chóng mặt hoặc tụt huyết áp nếu cơ thể chưa thích nghi.

🍎 Kết hợp ngon và cân bằng hơn — Tiệm GỪNG thường phối củ dền cùng gừng (thơm ấm, dễ uống), táo (ngọt thanh tự nhiên), cà rốt (bổ sung beta-carotene), cần tây (vị thanh mát).

🥛 Lưu ý nhỏ: không nên pha nước ép củ dền với sữa, vì có thể gây khó chịu cho hệ tiêu hóa ở một số người.

Tại Tiệm GỪNG, công thức luôn được phối theo tỷ lệ cân bằng — không phải ly có nhiều nguyên liệu nhất là ngon nhất, mà là ly phù hợp để cơ thể hấp thu và duy trì được lâu dài. 🌿`,
  },
  {
    slug: "vi-sao-uong-ginger-shot-moi-sang",
    title: "Vì sao nhiều người uống Ginger Shot mỗi sáng lại thấy nhẹ bụng hơn?",
    tag: "detox",
    read_time: "3 phút",
    body: `Gừng trong Ginger Shot mang lại 2 lợi ích rõ nhất mà nhiều khách của Tiệm GỪNG phản hồi lại:

Hỗ trợ tiêu hóa 🌱 — gừng kích thích tiêu hóa, giảm đầy hơi, chướng bụng, giúp cơ thể nhẹ nhàng hơn sau bữa ăn.

Chống viêm — hỗ trợ chuyển hóa ⚡ — các hợp chất chống oxy hóa trong gừng giúp giảm viêm mạn tính mức độ thấp, tạo điều kiện thuận lợi cho quá trình chuyển hóa năng lượng.

Nhưng thật lòng, GỪNG không nghĩ Ginger Shot là "thuốc" hay uống một chai là khỏe ngay. Nhiều người thấy hiệu quả rõ rệt không chỉ nhờ gừng, mà vì khi bắt đầu thói quen uống mỗi sáng, họ cũng đồng thời: uống đủ nước hơn, ăn sáng đều hơn, hạn chế nước ngọt, ít ăn vặt hơn, chủ động chăm sóc sức khỏe hơn.

Chính những thay đổi nhỏ này, kết hợp cùng tác dụng hỗ trợ của gừng, mới tạo nên kết quả bền vững. Một chai Ginger Shot nhỏ mỗi ngày, uống cùng chế độ ăn cân bằng, ngủ đủ và vận động đều — là một cách nhỏ để chủ động quan tâm đến cơ thể hơn. 🍋🫚`,
  },
  {
    slug: "kombucha-loi-khuan-tu-dau",
    title: "Trà Kombucha có lợi khuẩn từ đâu? Bí mật nằm ở quá trình lên men",
    tag: "cong-thuc",
    read_time: "2 phút",
    body: `🫧 Kombucha được tạo ra từ trà, đường và hệ cộng sinh vi sinh vật SCOBY (Symbiotic Culture of Bacteria and Yeast).

Trong quá trình lên men, nấm men và vi khuẩn có lợi cùng hoạt động, tạo nên những hợp chất đặc trưng làm nên hương vị chua thanh, sảng khoái rất riêng của Kombucha.

Điều làm Kombucha trở nên đặc biệt là những lợi khuẩn này không được bổ sung từ bên ngoài, mà được tạo ra tự nhiên nhờ quá trình lên men sống — đúng tinh thần "làm mới mỗi ngày" mà Tiệm GỪNG theo đuổi.

Một lon Kombucha không chỉ là thức uống giải khát, mà còn là thành quả của hàng tuần lên men tự nhiên và sự chuyển hóa kỳ diệu của hệ SCOBY. 💛`,
  },
  {
    slug: "4-kieu-tiet-kiem-vo-dung-suc-khoe",
    title: "4 kiểu \"tiết kiệm\" khiến sức khỏe âm thầm trả giá",
    tag: "song-khoe",
    read_time: "3 phút",
    body: `Có những khoản tiền mình tưởng là đang tiết kiệm... nhưng thật ra chỉ là đang để dành cho bệnh viện. 🥲

1️⃣ Không dám ăn ngon, không dám chăm sóc bản thân — tiền thì giữ được, nhưng sức khỏe cứ âm thầm đi xuống, đến lúc bệnh thì tiền tích góp lại lần lượt mang đi khám chữa bệnh.

2️⃣ Cố ăn hết đồ hư vì tiếc — ăn hết quả hỏng, quả tươi lại tiếp tục hỏng, một vòng luẩn quẩn. Mua ít hơn một chút nhưng ăn tươi — ăn đủ — ăn đều, cơ thể được chăm sóc tốt hơn nhiều.

3️⃣ Đồ ăn quá hạn cũng không nỡ vứt — tiền không mất vì bỏ đồ ăn, tiền mất nhiều hơn khi sức khỏe bắt đầu có vấn đề.

4️⃣ Cố làm, cố chịu, cố "tiết kiệm" sức khỏe — làm việc quá sức, ngồi sai tư thế, thức khuya, bỏ bữa, không vận động. Đến một ngày cơ thể lên tiếng, muốn khỏe lại không còn đơn giản như lúc giữ gìn từ đầu.

🌱 Sức khỏe cũng cần được chăm mỗi ngày — không cần bắt đầu bằng điều gì quá lớn lao, chỉ cần mỗi ngày tiện hơn một chút để duy trì lâu hơn. 🌿`,
  },
  {
    slug: "detox-khong-phai-la-nhin-an",
    title: "Detox không phải là nhịn ăn — mà là quay lại với điều cơ thể thật sự cần",
    tag: "detox",
    read_time: "3 phút",
    body: `Mỗi khi công việc quá nhiều, áp lực chồng áp lực, nhiều người ăn uống rất thất thường — bỏ bữa, uống trà sữa/cà phê, ăn đồ ngọt để lấy năng lượng. Chỉ sau vài ngày, cơ thể bắt đầu lên tiếng: bụng nặng hơn, người uể oải, da xỉn màu, sáng dậy vẫn mệt dù ngủ đủ.

Với Tiệm GỪNG, detox không phải là nhịn ăn hay ép cân. Detox đơn giản là quay lại với những điều cơ thể thật sự cần: uống đủ nước, bổ sung nhiều rau xanh và trái cây, hạn chế đồ ăn chế biến sẵn, giảm đường, giảm dầu mỡ và để hệ tiêu hóa có một khoảng nghỉ.

Đừng kỳ vọng một phép màu chỉ sau vài ngày. Nhưng nếu kết hợp detox với chế độ ăn cân bằng và vận động hợp lý, cơ thể sẽ nhẹ nhàng hơn, hình thành thói quen tốt hơn và có thêm động lực để tiếp tục hành trình chăm sóc sức khỏe.

Mỗi tháng, hãy dành ít nhất 7 ngày để yêu lại cơ thể của mình. Thương mình một chút, cơ thể sẽ biết cách cảm ơn bạn. 🌿💚`,
  },
];

const { data: pData, error: pError } = await supabase
  .from("products")
  .insert(products)
  .select();
console.log(
  pError ? "LOI products: " + pError.message : `Da them ${pData.length} products`
);

const { data: bData, error: bError } = await supabase
  .from("posts")
  .insert(posts)
  .select();
console.log(
  bError ? "LOI posts: " + bError.message : `Da them ${bData.length} posts`
);
