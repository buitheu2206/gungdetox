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
    image_url: "/images/products/sua-hat-tuoi.webp",
    sort_order: 5,
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
    image_url: "/images/products/coco-matcha.webp",
    sort_order: 8,
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
    image_url: "/images/products/ginger-shot.webp",
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
    delivery_schedule: "theo tuần",
    bottle_options: ["glass", "plastic"],
    image_url: "/images/products/combo-3-thang-ginger-shot.webp",
    sort_order: 10,
  },

  // ---- 5 SET DETOX TỰ NHIÊN (type: set) — mục 6.2.1 ----
  {
    slug: "set-1-xanh-thanh-loc",
    type: "set",
    name: "Set 1 — Xanh Thanh Lọc",
    category: "set-detox",
    description:
      "Set 7 chai xanh mát cho 1 tuần thải độc nhẹ nhàng: rau củ ép tươi giúp làm mát gan, giảm đầy bụng, hỗ trợ tiêu hóa sau những ngày ăn uống thất thường.",
    set_goal: "Thải độc – Làm mát – Giảm đầy bụng",
    price: 160000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "green",
    image_url: "/images/products/set-1-xanh-thanh-loc.webp",
    sort_order: 11,
  },
  {
    slug: "set-2-ginger-thom-tai-tao",
    type: "set",
    name: "Set 2 — Ginger Thơm Tái Tạo",
    category: "set-detox",
    description:
      "Set 7 chai vàng thơm mùi gừng và trái cây, giàu vitamin C — combo bán chạy nhất, giúp tăng đề kháng và cấp ẩm cho da trong 1 tuần.",
    set_goal: "Tăng đề kháng – Bổ sung vitamin – Đẹp da",
    price: 160000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "yellow",
    badge: "best-seller",
    image_url: "/images/products/set-2-ginger-thom-tai-tao.webp",
    sort_order: 12,
  },
  {
    slug: "set-3-do-giam-can",
    type: "set",
    name: "Set 3 — Đỏ Giảm Cân",
    category: "set-detox",
    description:
      "Set 7 chai đỏ vị trái cây chua nhẹ kết hợp gừng, hỗ trợ đốt mỡ và tiêu hóa — lựa chọn cho tuần detox giảm cân, giảm mỡ bụng.",
    set_goal: "Đốt mỡ – Hỗ trợ tiêu hóa – Giảm mỡ bụng",
    price: 170000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "red",
    image_url: "/images/products/set-3-do-giam-can.webp",
    sort_order: 13,
  },
  {
    slug: "set-4-ginger-cam-tieu-hoa-tot",
    type: "set",
    name: "Set 4 — Ginger Cam Tiêu Hóa Tốt",
    category: "set-detox",
    description:
      "Set 7 chai cam gừng ấm bụng, giảm đầy hơi, dịu dạ dày — phù hợp cho tuần cần chăm sóc hệ tiêu hóa nhẹ nhàng.",
    set_goal: "Hỗ trợ tiêu hóa – Giảm đầy hơi – Dịu dạ dày",
    price: 160000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "orange",
    image_url: "/images/products/set-4-ginger-cam-tieu-hoa-tot.webp",
    sort_order: 14,
  },
  {
    slug: "set-5-mix-can-bang",
    type: "set",
    name: "Set 5 — Mix Cân Bằng",
    category: "set-detox",
    description:
      "Set 7 chai phối trộn đủ vị xanh - vàng - đỏ - cam, cân bằng dinh dưỡng cho một tuần detox toàn diện mà không nhàm chán.",
    set_goal: "Cân bằng dinh dưỡng – Detox toàn diện",
    price: 160000,
    servings: 7,
    bottle_options: ["glass"],
    color_theme: "mix",
    image_url: "/images/products/set-5-mix-can-bang.webp",
    sort_order: 15,
  },
];

const posts = [
  {
    slug: "uong-nuoc-ep-cu-den-dung-cach",
    title: "Uống nước ép củ dền đúng cách để cơ thể hấp thu tốt hơn",
    tag: "eat-clean",
    read_time: "3 phút",
    image_url: "/images/blog/uong-nuoc-ep-cu-den-dung-cach.webp",
    body: `Nhiều người nghĩ nước ép củ dền càng uống nhiều, càng thải độc nhanh. Sự thật thì ngược lại — uống đúng cách mới là điều quyết định hiệu quả.

🌱 Mới bắt đầu? Đừng vội uống nguyên chất. Pha cùng táo, chanh hoặc gừng để vị dễ chịu hơn, cho cơ thể thời gian làm quen dần.

🥤 Mỗi lần chỉ nên uống tối đa 250ml — không cần nhiều, chỉ cần đều.

📅 1-2 lần/tuần là đủ. Củ dền chứa nitrat tự nhiên khá cao, uống mỗi ngày có thể khiến một số người chóng mặt hoặc tụt huyết áp nếu cơ thể chưa quen.

🍎 Công thức Tiệm GỪNG hay dùng: củ dền + gừng (ấm bụng, dễ uống) + táo (ngọt thanh tự nhiên) + cà rốt (bổ sung beta-carotene) + cần tây (thanh mát, cân bằng vị).

🥛 Một lưu ý nhỏ hay bị bỏ qua: không nên pha củ dền chung với sữa, vì dễ gây khó chịu cho hệ tiêu hóa.

Với Tiệm GỪNG, một ly ngon không phải ly nhiều nguyên liệu nhất, mà là ly được phối đúng tỷ lệ để cơ thể hấp thu trọn vẹn và duy trì được lâu dài. 🌿`,
  },
  {
    slug: "vi-sao-uong-ginger-shot-moi-sang",
    title: "Vì sao nhiều người uống Ginger Shot mỗi sáng lại thấy nhẹ bụng hơn?",
    tag: "detox",
    read_time: "3 phút",
    image_url: "/images/blog/vi-sao-uong-ginger-shot-moi-sang.webp",
    body: `Ginger Shot nhỏ xíu nhưng lại là thức uống được nhắc tới nhiều nhất mỗi khi khách ghé Tiệm GỪNG. Lý do nằm ở 2 tác dụng rõ rệt nhất mà rất nhiều người phản hồi lại:

🌱 Hỗ trợ tiêu hóa — gừng kích thích tiêu hóa, giảm đầy hơi, chướng bụng, giúp cơ thể nhẹ nhàng hơn sau mỗi bữa ăn.

⚡ Chống viêm, hỗ trợ chuyển hóa — các hợp chất chống oxy hóa trong gừng giúp giảm viêm mạn tính mức độ thấp, tạo điều kiện để cơ thể chuyển hóa năng lượng tốt hơn.

Nhưng thật lòng, GỪNG không nghĩ Ginger Shot là "thuốc" hay uống một chai là khỏe ngay lập tức. Rất nhiều người thấy hiệu quả rõ rệt không chỉ nhờ gừng — mà vì khi bắt đầu thói quen uống mỗi sáng, họ cũng vô tình thay đổi theo hướng tốt hơn: uống đủ nước hơn, ăn sáng đều đặn hơn, bớt nước ngọt, bớt ăn vặt, và chủ động quan tâm đến cơ thể mình hơn.

Chính những thay đổi nhỏ đó, cộng với tác dụng hỗ trợ từ gừng, mới là thứ tạo nên kết quả bền vững — chứ không phải bản thân chai Ginger Shot. Một chai nhỏ mỗi sáng, đi cùng chế độ ăn cân bằng, ngủ đủ giấc và vận động đều đặn, là một cách đơn giản để bắt đầu chăm sóc cơ thể tốt hơn mỗi ngày. 🍋🫚`,
  },
  {
    slug: "kombucha-loi-khuan-tu-dau",
    title: "Trà Kombucha có lợi khuẩn từ đâu? Bí mật nằm ở quá trình lên men",
    tag: "cong-thuc",
    read_time: "2 phút",
    image_url: "/images/blog/kombucha-loi-khuan-tu-dau.webp",
    body: `Vị chua thanh, sảng khoái rất riêng của Kombucha không đến từ đường hay hương liệu — mà từ cả một hệ sinh thái vi sinh vật đang âm thầm làm việc bên trong từng lon.

🫧 Kombucha được tạo ra từ trà, đường và SCOBY — viết tắt của Symbiotic Culture of Bacteria and Yeast, tức hệ cộng sinh giữa nấm men và vi khuẩn có lợi.

Trong suốt quá trình lên men, nấm men và vi khuẩn cùng hoạt động, chuyển hóa đường trong trà thành hàng loạt hợp chất mới — chính là thứ tạo nên hương vị đặc trưng của Kombucha.

Điều đặc biệt: những lợi khuẩn này không được bổ sung từ bên ngoài như một số sản phẩm men vi sinh, mà sinh ra hoàn toàn tự nhiên qua quá trình lên men sống — đúng tinh thần "làm mới mỗi ngày" mà Tiệm GỪNG luôn theo đuổi.

Vậy nên một lon Kombucha không đơn thuần là thức uống giải khát. Đó là thành quả của hàng tuần lên men kiên nhẫn, và cả sự chuyển hóa kỳ diệu của một hệ SCOBY sống khỏe mạnh. 💛`,
  },
  {
    slug: "4-kieu-tiet-kiem-vo-dung-suc-khoe",
    title: "4 kiểu \"tiết kiệm\" khiến sức khỏe âm thầm trả giá",
    tag: "song-khoe",
    read_time: "3 phút",
    image_url: "/images/blog/4-kieu-tiet-kiem-vo-dung-suc-khoe.webp",
    body: `Có những khoản tiền mình tưởng đang tiết kiệm được... nhưng thật ra chỉ đang để dành cho viện phí sau này. 🥲

1️⃣ Không dám ăn ngon, không dám chăm sóc bản thân — tiền thì giữ được đó, nhưng sức khỏe cứ âm thầm đi xuống từng ngày. Đến lúc bệnh, số tiền tích góp bấy lâu lại lần lượt ra đi vì thuốc men, khám chữa.

2️⃣ Cố ăn hết đồ đã hư vì tiếc — ăn hết phần hỏng thì phần tươi lại tiếp tục hỏng theo, một vòng luẩn quẩn không hồi kết. Mua ít lại một chút, nhưng ăn tươi, ăn đủ, ăn đều — cơ thể được chăm sóc tốt hơn nhiều so với việc "ăn hết cho đỡ phí".

3️⃣ Đồ ăn quá hạn cũng không nỡ bỏ — tiền không mất khi bỏ đồ ăn, nhưng mất nhiều hơn khi sức khỏe bắt đầu trục trặc vì những thứ đáng lẽ không nên ăn.

4️⃣ Cố làm, cố chịu, cố "tiết kiệm" sức khỏe của chính mình — làm việc quá sức, ngồi sai tư thế, thức khuya, bỏ bữa, lười vận động. Đến một ngày cơ thể lên tiếng, muốn khỏe lại không còn dễ như lúc mới bắt đầu giữ gìn.

🌱 Sức khỏe cần được chăm mỗi ngày, không cần bắt đầu bằng điều gì quá lớn lao — chỉ cần tiện hơn một chút mỗi ngày, để duy trì được lâu hơn. 🌿`,
  },
  {
    slug: "detox-khong-phai-la-nhin-an",
    title: "Detox không phải là nhịn ăn — mà là quay lại với điều cơ thể thật sự cần",
    tag: "detox",
    read_time: "3 phút",
    image_url: "/images/blog/detox-khong-phai-la-nhin-an.webp",
    body: `Mỗi khi công việc dồn dập, áp lực chồng áp lực, rất nhiều người bắt đầu ăn uống thất thường — bỏ bữa, uống trà sữa hay cà phê thay bữa sáng, ăn đồ ngọt để lấy năng lượng tạm thời. Chỉ sau vài ngày, cơ thể bắt đầu lên tiếng: bụng nặng hơn, người uể oải, da xỉn màu, sáng dậy vẫn mệt dù đã ngủ đủ giờ.

Với Tiệm GỪNG, detox chưa bao giờ là nhịn ăn hay ép cân. Detox đơn giản là quay lại với những điều cơ thể thật sự cần: uống đủ nước, ăn nhiều rau xanh và trái cây hơn, hạn chế đồ ăn chế biến sẵn, giảm đường, giảm dầu mỡ, và cho hệ tiêu hóa một khoảng nghỉ xứng đáng.

Đừng kỳ vọng một phép màu chỉ sau vài ngày detox. Nhưng nếu kết hợp cùng chế độ ăn cân bằng và vận động hợp lý, cơ thể sẽ dần nhẹ nhàng hơn, thói quen tốt hơn sẽ hình thành, và bạn sẽ có thêm động lực để tiếp tục hành trình chăm sóc sức khỏe của mình.

Mỗi tháng, hãy dành ít nhất 7 ngày để yêu lại cơ thể mình một lần. Thương mình một chút, cơ thể sẽ biết cách cảm ơn bạn. 🌿💚`,
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
