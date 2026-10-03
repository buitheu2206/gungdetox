import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const updates = [
  {
    slug: "uong-nuoc-ep-cu-den-dung-cach",
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
    body: `Ginger Shot nhỏ xíu nhưng lại là thức uống được nhắc tới nhiều nhất mỗi khi khách ghé Tiệm GỪNG. Lý do nằm ở 2 tác dụng rõ rệt nhất mà rất nhiều người phản hồi lại:

🌱 Hỗ trợ tiêu hóa — gừng kích thích tiêu hóa, giảm đầy hơi, chướng bụng, giúp cơ thể nhẹ nhàng hơn sau mỗi bữa ăn.

⚡ Chống viêm, hỗ trợ chuyển hóa — các hợp chất chống oxy hóa trong gừng giúp giảm viêm mạn tính mức độ thấp, tạo điều kiện để cơ thể chuyển hóa năng lượng tốt hơn.

Nhưng thật lòng, GỪNG không nghĩ Ginger Shot là "thuốc" hay uống một chai là khỏe ngay lập tức. Rất nhiều người thấy hiệu quả rõ rệt không chỉ nhờ gừng — mà vì khi bắt đầu thói quen uống mỗi sáng, họ cũng vô tình thay đổi theo hướng tốt hơn: uống đủ nước hơn, ăn sáng đều đặn hơn, bớt nước ngọt, bớt ăn vặt, và chủ động quan tâm đến cơ thể mình hơn.

Chính những thay đổi nhỏ đó, cộng với tác dụng hỗ trợ từ gừng, mới là thứ tạo nên kết quả bền vững — chứ không phải bản thân chai Ginger Shot. Một chai nhỏ mỗi sáng, đi cùng chế độ ăn cân bằng, ngủ đủ giấc và vận động đều đặn, là một cách đơn giản để bắt đầu chăm sóc cơ thể tốt hơn mỗi ngày. 🍋🫚`,
  },
  {
    slug: "kombucha-loi-khuan-tu-dau",
    body: `Vị chua thanh, sảng khoái rất riêng của Kombucha không đến từ đường hay hương liệu — mà từ cả một hệ sinh thái vi sinh vật đang âm thầm làm việc bên trong từng lon.

🫧 Kombucha được tạo ra từ trà, đường và SCOBY — viết tắt của Symbiotic Culture of Bacteria and Yeast, tức hệ cộng sinh giữa nấm men và vi khuẩn có lợi.

Trong suốt quá trình lên men, nấm men và vi khuẩn cùng hoạt động, chuyển hóa đường trong trà thành hàng loạt hợp chất mới — chính là thứ tạo nên hương vị đặc trưng của Kombucha.

Điều đặc biệt: những lợi khuẩn này không được bổ sung từ bên ngoài như một số sản phẩm men vi sinh, mà sinh ra hoàn toàn tự nhiên qua quá trình lên men sống — đúng tinh thần "làm mới mỗi ngày" mà Tiệm GỪNG luôn theo đuổi.

Vậy nên một lon Kombucha không đơn thuần là thức uống giải khát. Đó là thành quả của hàng tuần lên men kiên nhẫn, và cả sự chuyển hóa kỳ diệu của một hệ SCOBY sống khỏe mạnh. 💛`,
  },
  {
    slug: "4-kieu-tiet-kiem-vo-dung-suc-khoe",
    body: `Có những khoản tiền mình tưởng đang tiết kiệm được... nhưng thật ra chỉ đang để dành cho viện phí sau này. 🥲

1️⃣ Không dám ăn ngon, không dám chăm sóc bản thân — tiền thì giữ được đó, nhưng sức khỏe cứ âm thầm đi xuống từng ngày. Đến lúc bệnh, số tiền tích góp bấy lâu lại lần lượt ra đi vì thuốc men, khám chữa.

2️⃣ Cố ăn hết đồ đã hư vì tiếc — ăn hết phần hỏng thì phần tươi lại tiếp tục hỏng theo, một vòng luẩn quẩn không hồi kết. Mua ít lại một chút, nhưng ăn tươi, ăn đủ, ăn đều — cơ thể được chăm sóc tốt hơn nhiều so với việc "ăn hết cho đỡ phí".

3️⃣ Đồ ăn quá hạn cũng không nỡ bỏ — tiền không mất khi bỏ đồ ăn, nhưng mất nhiều hơn khi sức khỏe bắt đầu trục trặc vì những thứ đáng lẽ không nên ăn.

4️⃣ Cố làm, cố chịu, cố "tiết kiệm" sức khỏe của chính mình — làm việc quá sức, ngồi sai tư thế, thức khuya, bỏ bữa, lười vận động. Đến một ngày cơ thể lên tiếng, muốn khỏe lại không còn dễ như lúc mới bắt đầu giữ gìn.

🌱 Sức khỏe cần được chăm mỗi ngày, không cần bắt đầu bằng điều gì quá lớn lao — chỉ cần tiện hơn một chút mỗi ngày, để duy trì được lâu hơn. 🌿`,
  },
  {
    slug: "detox-khong-phai-la-nhin-an",
    body: `Mỗi khi công việc dồn dập, áp lực chồng áp lực, rất nhiều người bắt đầu ăn uống thất thường — bỏ bữa, uống trà sữa hay cà phê thay bữa sáng, ăn đồ ngọt để lấy năng lượng tạm thời. Chỉ sau vài ngày, cơ thể bắt đầu lên tiếng: bụng nặng hơn, người uể oải, da xỉn màu, sáng dậy vẫn mệt dù đã ngủ đủ giờ.

Với Tiệm GỪNG, detox chưa bao giờ là nhịn ăn hay ép cân. Detox đơn giản là quay lại với những điều cơ thể thật sự cần: uống đủ nước, ăn nhiều rau xanh và trái cây hơn, hạn chế đồ ăn chế biến sẵn, giảm đường, giảm dầu mỡ, và cho hệ tiêu hóa một khoảng nghỉ xứng đáng.

Đừng kỳ vọng một phép màu chỉ sau vài ngày detox. Nhưng nếu kết hợp cùng chế độ ăn cân bằng và vận động hợp lý, cơ thể sẽ dần nhẹ nhàng hơn, thói quen tốt hơn sẽ hình thành, và bạn sẽ có thêm động lực để tiếp tục hành trình chăm sóc sức khỏe của mình.

Mỗi tháng, hãy dành ít nhất 7 ngày để yêu lại cơ thể mình một lần. Thương mình một chút, cơ thể sẽ biết cách cảm ơn bạn. 🌿💚`,
  },
];

for (const u of updates) {
  const { error } = await supabase.from("posts").update({ body: u.body }).eq("slug", u.slug);
  console.log(u.slug, error ? "ERROR: " + error.message : "OK");
}
