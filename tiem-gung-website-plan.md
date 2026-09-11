# Plan xây dựng website GỪNG DETOX (Tiệm GỪNG)

## 1. Thông tin doanh nghiệp (trích từ Facebook facebook.com/gungdetox)

- **Tên thương hiệu chính thức**: **GỪNG DETOX** (khớp domain `gungdetox.com` và logo thật `icon.jpg`, tagline "SỐNG XANH - SỐNG KHỎE") — thường được gọi thân mật là **"Tiệm GỪNG"** trong nội dung/giọng văn trên Facebook. Quy ước dùng trong plan: **"GỪNG DETOX"** cho logo/header/tiêu đề trang/pháp lý; **"Tiệm GỪNG"** cho giọng văn thân mật trong nội dung/copy — đồ uống lên men/detox từ gừng tươi, giao tận nhà theo tuần tại TP.HCM
- **Địa chỉ**: 60M Nguyễn Thông, Quận 3, TP.HCM · và điểm thứ 2 tại Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM
- **Giờ hoạt động**: 7:00 – 22:00 hằng ngày (nghỉ vệ sinh/refresh ngày 30 hàng tháng)
- **Hotline/Zalo**: 0888 267 009 (kênh chính) · 0973 907 937 (xuất hiện ở một số bài đăng/hashtag) · Group Zalo khách quen: https://zalo.me/g/fpboqw423
- **Email**: gingera.ltd@gmail.com
- **Instagram**: @gungdetox.saigon
- **Facebook**: facebook.com/gungdetox
- **Kênh giao hàng**: không hỗ trợ GrabFood/ứng dụng giao đồ ăn (giá trên app bị đội cao hơn 30-40% so với đặt trực tiếp) — chỉ nhận đặt qua inbox Facebook/Zalo/hotline
- **Nhóm sản phẩm chính** (đã mở rộng nhiều hơn so với nhận định ban đầu — xem bảng giá đầy đủ ở mục 9):
  - **Juice ép tươi**: 21 vị (J1-J21), chia 3 combo theo mục tiêu (thanh lọc/tiêu hóa, đẹp da/vitamin, fresh/chống oxy hóa)
  - **Smoothies đông lạnh**: 18-20 vị (S1-S20+), pha tại nhà chỉ cần thêm nước/sữa hạt rồi xay
  - **Sữa hạt tươi**: nấu mới sau khi đặt, nguyên liệu hạnh nhân/óc chó/macca/hạt điều/hạt sen/yến mạch, chia 5 combo theo mục tiêu
  - **Ginger Shot** (gừng + nghệ + chanh vàng + mật ong + muối hồng) — sản phẩm chủ lực/best-seller
  - **Bia Gừng / Ginger Beer** — lên men tự nhiên, không cồn, dễ tiêu
  - **Kombucha** — đủ vị, lên men trà tự nhiên với SCOBY
  - **Matcha** (dòng mới, đang ra mắt dần): Matcha Sữa, Cold Whisk Matcha, Coco Matcha, Coco Houjicha, Coco Cacao
  - **Củ Dền Gừng ngâm** (hũ) — dùng cho cả gia đình, phù hợp làm quà biếu
  - Tất cả làm mới mỗi ngày theo quy trình riêng của tiệm
- **Mô hình bán hàng**: Combo thuê bao/gói theo liệu trình (xem giá đầy đủ mục 9)
  - Combo tháng Ginger Shot (chai nhựa): 500K/550K — 28 lần uống, giao 4 đợt/tuần, mỗi chai 220ml = 7 lần uống (30ml/lần)
  - Combo Ginger Shot 3 tháng: 1.500K (giao theo tuần)
- **Hệ thống chai refill**: chai thủy tinh (sang, chắc, dùng lâu dài) hoặc chai nhựa (gọn, nhẹ, dễ trữ đông/mang đi xa) — khách chọn theo nhu cầu
- **Kênh đặt hàng**: không có giỏ hàng online — khách đặt qua inbox Facebook/Zalo
- **Giọng điệu thương hiệu**: thân mật, gọi khách là "chị em", dùng emoji 💚🌿, nội dung xoay quanh sức khỏe/eat clean/detox
- **Đối tượng khách hàng**: phụ nữ quan tâm sức khỏe, lối sống lành mạnh
- **Mô hình khác đang triển khai song song**: nhượng quyền tiệm trái cây/juice healthy (vốn dưới 20 triệu, kèm SOP/menu/công thức) — đây là mảng B2B riêng, **không thuộc phạm vi website khách hàng lẻ** này, có thể cân nhắc 1 trang riêng nếu chủ tiệm muốn sau này

## 2. Cấu trúc trang tham chiếu — mexoaikechuyen.vn

Trang tham chiếu là dạng landing page storytelling một trang (single-page), cấu trúc theo thứ tự:

1. Header: logo + tagline + link "Thành viên"
2. Hero: H1 chào + câu hỏi tương tác + CTA
3. Social follow (TikTok/Facebook/YouTube)
4. Journey carousel: các mốc hành trình cá nhân
5. Khám phá: 4 mục điều hướng (Blog, Đồ hay dùng, Đặt nước, Bí kíp)
6. Quote cá nhân
7. Liên hệ (địa chỉ Google Maps + hotline)
8. Footer: chính sách (bảo mật, đổi trả, vận chuyển, thanh toán)

Các trang con tương ứng: `/blog` (bài viết), `/do-hay-dung` (affiliate sản phẩm), `/dat-nuoc` (menu, không giỏ hàng), `/bi-kip` (landing bán khóa học, nội dung khóa sau thanh toán).

### 2.1 Nhận định về nền tảng công nghệ (đã kiểm tra mã nguồn trang)

Kiểm tra HTML/response headers của mexoaikechuyen.vn cho thấy:
- Trang được build bằng **Lovable** (trước đây gọi là GPT Engineer — dấu vết: file ảnh lưu tại bucket `gpt-engineer-file-uploads`), một nền tảng "AI app builder"
- Đây là **React SPA** (không phải WordPress/Shopify/Sapo/Haravan), có tên component kiểu `EditableImage`, `EditableLink` — cho thấy có trình chỉnh sửa trực quan (visual editor)
- Nền tảng Lovable thường đi kèm **Supabase** làm backend (auth + database + storage) — điều này giải thích vì sao trang có được các chức năng "động" như đăng nhập Thành viên và (có khả năng) tra cứu đơn hàng, dù đây chỉ là 1 shop nhỏ

**Ý nghĩa cho Tiệm GỪNG**: muốn có các chức năng tương tự (Thành viên, tra cứu đơn) ngay từ đầu thì cần một backend nhẹ (không thể làm bằng site tĩnh thuần HTML/Astro không database) — xem điều chỉnh đề xuất công nghệ ở mục 8.1.

## 3. Chức năng cốt lõi nên có cho shop nhỏ (tham chiếu mexoaikechuyen.vn + các shop online nhỏ khác)

Tổng hợp các chức năng phổ biến ở những trang bán hàng nhỏ làm tốt (không chỉ riêng mexoaikechuyen.vn — các shop F&B/mỹ phẩm nhỏ tại VN thường có mô hình tương tự), đối chiếu mức độ cần thiết cho Tiệm GỪNG:

| Chức năng | Có ở mexoaikechuyen.vn? | Áp dụng cho Tiệm GỪNG? |
|---|---|---|
| Trang danh sách sản phẩm/menu theo danh mục | Có (`/dat-nuoc`) | **Có** — mục 6.2 |
| Đặt hàng không cần giỏ hàng phức tạp (CTA → inbox/Zalo) | Có | **Có** — mục 6.3 Phương án A |
| Tra cứu đơn hàng bằng SĐT (không cần đăng nhập) | Có (nhắc trên trang `/dat-nuoc`) | **Nên có ngay từ đầu** — ít tốn kém nếu dùng Supabase, giảm số tin nhắn hỏi "đơn tới đâu rồi" |
| Tài khoản Thành viên (đăng nhập/đăng ký) | Có (link "Thành viên") | **Cân nhắc** — hữu ích nếu làm chương trình tích điểm/ưu đãi khách quen (phù hợp mô hình combo thuê bao lặp lại của Tiệm GỪNG); có thể để Phase 2 |
| Blog/nội dung giá trị (SEO + giữ chân khách) | Có (`/blog`) | **Có** — mục 6.5 |
| Trang giới thiệu quy trình/nguyên liệu (xây niềm tin) | Có (dạng journey cá nhân) | **Có**, điều chỉnh thành "quy trình sản xuất" — mục 6.4 |
| Trang sản phẩm liên quan/affiliate (`/do-hay-dung`) | Có | **Không cần** — Tiệm GỪNG tự sản xuất, không bán affiliate |
| Landing bán khóa học riêng (`/bi-kip`) | Có | **Không cần** trừ khi Tiệm GỪNG có ý định bán khóa học/công thức riêng |
| Nút chat nổi (Zalo/Messenger) toàn site | Phổ biến ở shop nhỏ nói chung | **Có** — nên thêm là widget cố định góc màn hình, không riêng 1 trang |
| Chính sách (đổi trả, giao hàng, thanh toán, bảo mật) | Có | **Có** — bắt buộc để tạo niềm tin, mục 6.6 |
| Tích hợp Google Maps + giờ hoạt động | Có | **Có** — mục 6.6 |
| Thanh toán online (VNPay/Momo) | Không thấy | **Không cần ở Phase 1** — Tiệm GỪNG hiện thu tiền qua chuyển khoản/COD thủ công |

## 4. Đề xuất cấu trúc cho Tiệm GỪNG

| Section gốc | Áp dụng cho Tiệm GỪNG |
|---|---|
| Header (logo + tagline) | Logo **"GỪNG DETOX"** (dùng file `icon.jpg` thật) + tagline **"SỐNG XANH - SỐNG KHỎE"** (theo đúng logo, thay cho tagline tự đặt trước đó) |
| Hero (H1 + CTA) | H1 "Tiệm GỪNG xin chào!" + CTA "Xem menu" / "Đặt combo" |
| Social follow | Facebook, Instagram |
| Journey carousel | Thay bằng "Vì sao chọn GỪNG" — quy trình làm mới mỗi ngày, nguyên liệu thật, minh bạch |
| Khám phá (4 mục) | Menu đồ uống / Combo thuê bao / Bí kíp detox (blog sức khỏe) / Chai refill (giải thích glass vs nhựa) |
| Quote cá nhân | Trích một câu từ bài post gần đây, giữ giọng "chị em" |
| Liên hệ | Địa chỉ (Google Maps) + Hotline/Zalo + Email |
| Footer chính sách | Chính sách đổi trả chai refill, giao hàng theo tuần, thanh toán |

**Khác biệt quan trọng so với bản gốc**: Tiệm GỪNG không bán qua giỏ hàng online — flow thực tế là xem menu/combo → CTA dẫn thẳng về Zalo/Messenger để đặt, thay vì form đặt hàng như `/dat-nuoc` của mexoaikechuyen.vn. Bù lại, Tiệm GỪNG nên có thêm **tra cứu đơn bằng SĐT** ngay từ Phase 1 (xem mục 3) vì chi phí thêm không lớn khi đã dùng Supabase.

## 5. Hướng thiết kế (đã chốt màu theo logo + ảnh thật, chưa build)

- **Đã có tài sản thương hiệu chính thức** (chủ tiệm cung cấp trực tiếp, ưu tiên cao hơn màu suy đoán từ ảnh sản phẩm): `icon.jpg` (logo tròn) và `anh bìa.jpg` (ảnh bìa marketing) tại root repo.
  - **Logo** (`icon.jpg`): hình tròn viền xanh lá đậm, họa tiết lá 2 đầu (trên/dưới), chữ **"GỪNG"** màu nâu đậm kiểu chữ bo tròn, chữ **"DETOX"** màu xanh lá, tagline **"SỐNG XANH - SỐNG KHỎE"**, nền trắng. Ghi chú "4CM" trên file có vẻ là kích thước in (sticker/tem), không phải một phần thiết kế.
  - **Ảnh bìa** (`anh bìa.jpg`): banner giới thiệu **"Set trải nghiệm 5 SET DETOX TỰ NHIÊN"** — xem chi tiết sản phẩm mới ở mục 6.2.1 bên dưới. Logo góc trái trên nền xanh lá đậm (chữ "GỪNG DETOX" màu trắng), badge lá "100% TỰ NHIÊN" góc phải.
- ⚠️ **Tên thương hiệu trên tài liệu chính thức là "GỪNG DETOX"**, không phải "Tiệm GỪNG" như plan đang dùng — cần hỏi lại chủ tiệm tên chính thức nào dùng cho website (có thể "Tiệm GỪNG" là cách gọi thân mật trên Facebook, còn "GỪNG DETOX" là tên thương hiệu/logo chính thức). Trước mắt, mọi vị trí dùng logo (header, favicon) nên dùng đúng "GỪNG DETOX" theo file logo thật; phần văn phong/nội dung có thể vẫn giữ "Tiệm GỪNG" như giọng điệu quen thuộc.
- **Màu sắc — đã điều chỉnh lại theo đúng logo thật** (ưu tiên hơn suy đoán từ ảnh sản phẩm trước đó):
  - **Xanh lá rừng đậm** (forest green) — màu chủ đạo, lấy trực tiếp từ viền logo + chữ "DETOX" + nền ảnh bìa → dùng cho header, nút CTA chính, logo
  - **Nâu đậm** (dark brown) — lấy từ chữ "GỪNG" trong logo → dùng cho heading/text nhấn mạnh, thay cho "vàng hổ phách" đã đề xuất trước đó (hạ vàng hổ phách xuống làm màu phụ/badge thay vì màu văn bản chính)
  - **Đỏ mận/đỏ củ dền** (deep berry red) — từ nước ép beetroot thật (đúng như "SET 3 ĐỎ GIẢM CÂN" trong ảnh bìa dùng tông đỏ) → accent cho tag/giá
  - **Nền trắng/kem nhạt** — theo đúng nền logo và ảnh bìa (trắng/kem sáng), không dùng nền kem đậm như đề xuất ban đầu
  - Vẫn giữ lưu ý cũ: ảnh poster "ANH NGỌC" tiếng Nga trong kho ảnh **không phải bộ nhận diện chính**, không dùng làm nguồn màu.
- **Font chữ**: đã xác nhận 2 font hỗ trợ đầy đủ dấu tiếng Việt (subset vietnamese trên Google Fonts):
  - **Fraunces** (serif có cá tính) — dùng cho heading/display
  - **Be Vietnam Pro** (sans hiện đại, thiết kế riêng cho tiếng Việt) — dùng cho nội dung/body
  - Lưu ý: font trong logo/ảnh bìa thật là kiểu chữ bo tròn đậm (rounded bold), khác với Fraunces (serif) — không cần đổi font toàn site theo logo, chỉ cần đảm bảo màu sắc khớp; phần chữ trong chính logo giữ nguyên như file gốc, không thiết kế lại
- **Bố cục**: multi-page giống bản gốc, nhưng thay carousel hành trình cá nhân bằng phần "quy trình làm mới mỗi ngày" — vì sản phẩm sức khỏe cần yếu tố tin cậy/minh bạch nguyên liệu hơn là câu chuyện cá nhân thuần túy.

## 6. Kế hoạch chi tiết từng trang (wireframe theo section + heading)

Sitemap đề xuất: `/` (Trang chủ) · `/san-pham` (Sản phẩm) · `/dat-hang` (Đặt hàng + tra cứu đơn) · `/quy-trinh` (Giới thiệu) · `/blog` (Bí kíp sức khỏe) · `/lien-he` (Liên hệ) · `/thanh-vien` (Thành viên, Phase 2)

### 6.1 Trang chủ — `/`
| # | Section | Heading | Nội dung/thành phần |
|---|---|---|---|
| 1 | Header | — | Logo **"GỪNG DETOX"** (`icon.jpg`) + tagline **"SỐNG XANH - SỐNG KHỎE"** + nav (Sản phẩm, Đặt hàng, Giới thiệu, Blog, Liên hệ) + link "Thành viên" |
| 2 | Hero | H1 | "Tiệm GỪNG xin chào!" + câu dẫn ngắn + CTA chính **"Xem sản phẩm"**, CTA phụ **"Đặt hàng ngay"** |
| 3 | Social follow | — | Icon Facebook, Instagram |
| 4 | Vì sao chọn GỪNG | H2 | 3-4 điểm: nguyên liệu thật (gừng tươi, nghệ, chanh vàng, mật ong, muối hồng), làm mới mỗi ngày, hệ chai refill sạch |
| 5 | Sản phẩm nổi bật | H2 | 3 card rút gọn: Ginger Shot / Bia Gừng / Kombucha, mỗi card có ảnh + giá từ + nút "Xem chi tiết" → sang `/san-pham` |
| 6 | Combo thuê bao | H2 | Tóm tắt 2 gói (Combo tháng 500K, Combo 3 tháng 1.500K) + nút "Xem gói" → sang `/san-pham#combo` |
| 7 | Quote thương hiệu | H3 | Trích 1 câu từ bài đăng thật của tiệm (giọng "chị em"), **không dùng testimonial gắn tên khách hàng thật** để khỏi phải xin phép từng khách |
| 8 | Liên hệ nhanh | H3 | Địa chỉ rút gọn (2 điểm) + hotline + 2 nút **"Chat Zalo"** / **"Nhắn Messenger"** ngang nhau |
| 9 | Footer | — | Chính sách đổi trả chai refill, giao hàng theo tuần, thanh toán; icon hình thức thanh toán (chuyển khoản/ví điện tử); social links; copyright |
| — | Widget cố định | — | 2 nút chat nổi Zalo + Messenger góc màn hình, hiển thị trên **mọi trang** |

### 6.2 Trang Sản phẩm — `/san-pham` (trọng tâm)
**Mục tiêu**: khách hiểu rõ toàn bộ sản phẩm, giá, quy cách trước khi quyết định đặt — đóng vai trò "danh mục sản phẩm" trung tâm của site.

| # | Section | Heading | Nội dung/thành phần |
|---|---|---|---|
| 1 | Header/breadcrumb | H1 | "Sản phẩm" — mô tả ngắn 1 dòng |
| 2 | Bộ lọc danh mục | — | Tab/chip: Tất cả · Ginger Shot · Bia Gừng · Kombucha · Combo thuê bao |
| 3 | Lưới sản phẩm lẻ | H2 "Đồ uống lẻ" | Card sản phẩm (xem cấu trúc card bên dưới) |
| 4 | Lưới combo thuê bao | H2 "Combo thuê bao" (anchor `#combo`) | Card combo (cấu trúc riêng, xem bên dưới) |
| 5 | Giải thích hệ chai + đổi/hoàn chai cũ | H3 "Chọn loại chai phù hợp" | So sánh 2 cột: Chai thủy tinh vs Chai nhựa (ưu/nhược, cách bảo quản, hướng dẫn refill) + box riêng giới thiệu **chương trình trả chai cũ được giảm giá/tặng điểm cho lần đặt sau** (ý tưởng từ đối thủ Lady Kombucha — mục 10) |
| 6 | FAQ ngắn | H3 | 3-4 câu hỏi thường gặp (đổi vị, giao hàng trễ, refill bẩn...) |
| 7 | Đặt cho văn phòng | H3 | 1 dòng CTA nhỏ "Đặt combo cho cả văn phòng/team" — hướng khách công ty tới cùng form đặt hàng, không cần trang riêng ở Phase 1 |
| 8 | Footer | — | như trang chủ |

**Cấu trúc 1 card sản phẩm lẻ:**
- **Media**: ảnh sản phẩm *(thiếu — cần bổ sung)*, có thể thay/kèm bằng **video ngắn** (quy trình pha chế, cách dùng) — card hỗ trợ cả 2 loại, ảnh làm mặc định, video phát khi hover/tap
- Tên + mô tả ngắn (thành phần chính, công dụng)
- **Nguồn gốc ngắn** (1-2 câu, vd. "Gừng tươi từ vùng nguyên liệu quen thuộc, ép mỗi sáng" — lấy từ nội dung thật ở mục 6.5.1, không bịa)
- Dung tích/quy cách
- Giá lẻ *(thiếu — hiện chỉ có giá combo)*
- Nhãn nếu có: Best-seller / Mới / Tạm hết / **Sale** (khi có khuyến mãi)
- Nút **"Đặt món này"** → sang `/dat-hang` kèm sản phẩm đã chọn

**Danh sách sản phẩm lẻ — đã cập nhật giá thật từ export Facebook** (xem chi tiết đầy đủ ở mục 9):

| Sản phẩm | Mô tả ngắn | Giá lẻ |
|---|---|---|
| Ginger Shot | Gừng + nghệ + chanh vàng + mật ong + muối hồng, 30ml/lần | Combo tháng 500-550K (28 lần) |
| Bia Gừng (Ginger Beer) | Gừng tươi + chanh + đường mía, lên men tự nhiên, không cồn | 49K/lon · 210K/lốc 6 lon |
| Juice ép tươi | 21 vị (J1-J21), chia 3 nhóm theo mục tiêu | 69K/chai lẻ · combo 7 chai 399K |
| Smoothies đông lạnh | 18-20 vị (S1-S20+), chỉ cần thêm nước/sữa hạt rồi xay | 49K/gói · 10 gói 490K · 20 gói 980K (tặng 2) |
| Sữa hạt tươi | Hạnh nhân/óc chó/macca/hạt điều/hạt sen/yến mạch, nấu mới sau khi đặt | 79K/chai · combo 7 gói 315K · combo 7 chai(350ml) 483K |
| Kombucha | Lên men trà tự nhiên với SCOBY, đủ vị | Combo 6 lon đủ vị 270K/lốc |
| Củ Dền Gừng ngâm | Hũ dùng cho cả gia đình, phù hợp biếu tặng | 199K/hũ |
| Matcha (sắp ra mắt) | Matcha Sữa, Cold Whisk Matcha, Coco Matcha, Coco Houjicha, Coco Cacao | Coco Matcha 79K/chai *(các vị khác chờ giá)* |

**Gói/liệu trình theo ngày:**

| Gói | Nội dung | Giá |
|---|---|---|
| Detox 1 ngày | 5 chai juice/smoothie theo khung giờ (7h30-18h) | 269K/ngày |
| **5 SET DETOX TỰ NHIÊN** (mới nhất — xem chi tiết 5 set ở mục 6.2.1) | 7 chai thủy tinh/set | 160-170K/set |
| Combo Ginger Shot tháng | 28 lần uống, giao 4 đợt/tuần | 500-550K |
| Combo Ginger Shot 3 tháng | Giao theo tuần | 1.500K |

*(Đã xác nhận: "5 SET DETOX TỰ NHIÊN" là dòng sản phẩm mới nhất, **thay thế hoàn toàn** "Combo Detox Juice 7 ngày 399K" trước đó — con số 399K không còn dùng, xem mục 6.2.1 và 9.1.)*

*(Ảnh/video sản phẩm thật: đã có sẵn trong export Facebook cục bộ — 703 ảnh + 32 video tại `facebook-gungdetox-11_09_2026-8rgEldK3/.../posts/media/` — dùng làm nguồn media khi build trang Sản phẩm, không cần chụp lại từ đầu.)*

### 6.2.1 Sản phẩm mới phát hiện từ ảnh bìa (`anh bìa.jpg`) — "5 SET DETOX TỰ NHIÊN"

Đây là dòng sản phẩm **chưa có trong dữ liệu Facebook đã đối chiếu ở mục 9** — do chủ tiệm cung cấp thêm qua ảnh bìa marketing thật. Cấu trúc: giao **7 chai thủy tinh/set**, 100% tự nhiên, mỗi set nhắm 1 mục tiêu sức khỏe riêng, có màu sắc phân biệt rõ:

| Set | Mục tiêu | Giá | Ghi chú |
|---|---|---|---|
| Set 1 — Xanh Thanh Lọc | Thải độc – Làm mát – Giảm đầy bụng | 160K/set (7 chai) | |
| Set 2 — Ginger Thơm Tái Tạo | Tăng đề kháng – Bổ sung vitamin – Đẹp da | 160K/set (7 chai) | Nhãn "Dễ uống nhất" + **Best Seller** |
| Set 3 — Đỏ Giảm Cân | Đốt mỡ – Hỗ trợ tiêu hóa – Giảm mỡ bụng | 170K/set (7 chai) | |
| Set 4 — Ginger Cam Tiêu Hóa Tốt | Hỗ trợ tiêu hóa – Giảm đầy hơi – Dịu dạ dày | 160K/set (7 chai) | |
| Set 5 — Mix Cân Bằng | Cân bằng dinh dưỡng – Detox toàn diện | 160K/set (7 chai) | |

✅ **Đã xác nhận với chủ tiệm**: đây là dòng sản phẩm **mới nhất**, thay thế hoàn toàn "Combo Detox Juice 7 ngày 399K" trong dữ liệu Facebook cũ (mục 9.1) — **không dùng giá 399K nữa**, chỉ dùng bảng 5 set (160-170K/set) này trên trang Sản phẩm chính thức.

Nên hiển thị 5 set này thành 1 lưới riêng trên trang `/san-pham` (giống cấu trúc "Set 1-5" trong ảnh bìa), mỗi set 1 card với màu badge riêng theo đúng tông màu trong ảnh (xanh/vàng cam/đỏ/cam/mix).

### 6.2.2 ⚠️ Thay đổi kiến trúc quan trọng: Sản phẩm quản lý qua trang Admin (Supabase), không phải file tĩnh

**Đã chốt theo yêu cầu chủ tiệm**: thay vì lưu sản phẩm bằng file nội dung tĩnh (Content Collections, phải nhờ dev sửa code mỗi khi đổi giá/thêm vị mới), toàn bộ sản phẩm (đồ uống lẻ, combo thuê bao, 5 Set Detox) sẽ lưu trong **1 bảng `products` ở Supabase**, có **trang quản trị `/admin/san-pham`** để chủ tiệm tự thêm/sửa/xoá sản phẩm — giống hệt cách blog hoạt động (mục 6.5.2).

**Lý do**: hiện chưa có đủ giá lẻ từng vị Kombucha/Matcha cụ thể (chỉ có giá combo/1 vị) — thay vì mất công tra cứu lại trong kho ảnh rồi hard-code vào file, chủ tiệm tự nhập giá thật cho từng vị **sau khi web đã lên**, qua trang admin, không cần nhờ dev mỗi lần đổi giá/thêm sản phẩm mới.

**Cho Phase 1 (lúc mới lên site)**: chỉ cần nhập **dữ liệu demo/placeholder** (dùng đúng các sản phẩm/giá đã biết chắc ở mục 9.1 và 6.2.1 làm dữ liệu khởi tạo) để trang `/san-pham` không bị trống — chủ tiệm bổ sung/chỉnh sửa dần qua `/admin/san-pham` sau khi quen tay, không cần đầy đủ 100% ngay lúc ra mắt.

**3 trang quản trị dùng chung 1 hệ thống đăng nhập** (Supabase Auth, chỉ chủ tiệm có tài khoản):
- `/admin/don-hang` — quản lý đơn hàng (đã có ở mục 8.1)
- `/admin/san-pham` — thêm/sửa/xoá sản phẩm (mới)
- `/admin/blog` — viết/đăng bài blog (mục 6.5.2, cũng mới quyết định)

Có thể gộp cả 3 vào 1 trang `/admin` dạng dashboard với tab chuyển qua lại, hoặc để 3 route riêng — quyết định lúc code, không ảnh hưởng kiến trúc dữ liệu.

**Cấu trúc 1 card combo thuê bao:**
- Tên gói (Combo tháng / Combo 3 tháng)
- Giá trọn gói (500K / 1.500K)
- Số lần uống + lịch giao (vd. 28 lần uống, giao 4 đợt/tuần, 220ml/chai = 7 lần)
- Lựa chọn loại chai ngay trên card: ⚪ Thủy tinh / ⚪ Nhựa
- Ghi chú "Giá chưa gồm phí ship"
- Nút **"Chọn combo này"** → sang `/dat-hang` giữ nguyên lựa chọn

### 6.3 Chức năng Đặt hàng + Tra cứu đơn — `/dat-hang` (trọng tâm)
Hiện tại Tiệm GỪNG **chưa có giỏ hàng online**, khách đặt qua inbox/Zalo thủ công. Chọn 1 trong 2 hướng cho phần **đặt hàng**, nhưng phần **tra cứu đơn bằng SĐT** nên có ngay từ đầu (xem mục 3) vì rẻ khi đã dùng Supabase.

**Phương án A — Đặt hàng đơn giản + tra cứu đơn (khuyến nghị cho bản đầu tiên)**

| # | Section | Nội dung |
|---|---|---|
| 1 | Tóm tắt lựa chọn | Hiển thị lại sản phẩm/combo + loại chai khách vừa chọn ở trang Sản phẩm |
| 2 | Nút hành động chính | **"Đặt qua Zalo"** → mở sẵn tin nhắn soạn trước (đã điền tên sản phẩm, loại chai, số lượng) tới Zalo OA của Tiệm GỪNG |
| 3 | Nút phụ | "Nhắn qua Messenger" (cùng nội dung soạn sẵn) |
| 4 | Ghi chú | Giờ phản hồi, khu vực giao hàng, chính sách thanh toán khi nhận (nếu có) |
| 5 | **Tra cứu đơn bằng SĐT** | Ô nhập SĐT → hiển thị trạng thái đơn gần nhất (Đang xử lý / Đang giao / Đã giao) — chủ tiệm cập nhật trạng thái thủ công qua trang quản trị đơn giản (xem 8.1). **Dùng chung 1 form tra cứu này để hiển thị luôn số lần đặt/chai đã trả** (bước đệm nhẹ cho tích điểm trước khi có tài khoản Thành viên đầy đủ ở Phase 3 — ý tưởng từ đối thủ Légumes, mục 10) |

- Đặt hàng vẫn xử lý thủ công qua Zalo như hiện tại; chỉ thêm 1 bảng đơn hàng đơn giản trong Supabase để chủ tiệm cập nhật trạng thái và khách tự tra cứu — không cần giỏ hàng/thanh toán online
- Ưu điểm: giữ đúng quy trình vận hành hiện có, nhưng giảm hẳn số tin nhắn khách hỏi "đơn tới đâu rồi", tạo cảm giác chuyên nghiệp như mexoaikechuyen.vn
- Nhược điểm: chủ tiệm cần thao tác cập nhật trạng thái đơn (dù đơn giản)

**Phương án B — Form đặt hàng tự phục vụ (đầy đủ, cần đầu tư thời gian hơn)**

| # | Section | Nội dung |
|---|---|---|
| 1 | Bước 1 — Sản phẩm | Xác nhận/chỉnh sản phẩm, combo, số lượng |
| 2 | Bước 2 — Tuỳ chọn | Loại chai (thủy tinh/nhựa), lịch giao theo tuần |
| 3 | Bước 3 — Thông tin giao hàng | Tên, SĐT, địa chỉ, ghi chú |
| 4 | Bước 4 — Xác nhận | Tóm tắt đơn + tổng tiền + nút "Đặt hàng" |
| 5 | Trang cảm ơn | Mã đơn hàng + liên kết sang tra cứu bằng SĐT |

- Đơn tự động lưu vào Supabase + gửi thông báo qua email/Zalo API cho chủ tiệm; khách nhận xác nhận qua SMS/email
- Ưu điểm: chuyên nghiệp nhất, giảm tối đa thao tác thủ công, dễ mở rộng (thanh toán online, quản lý khách hàng)
- Nhược điểm: cần thời gian phát triển nhiều hơn Phương án A

**Đã chốt**: dùng **Phương án B** ngay từ bản đầu tiên — form đặt hàng tự phục vụ nhiều bước, đơn lưu vào Supabase, kèm tra cứu đơn bằng SĐT. Điều này ảnh hưởng tới kiến trúc: cần xây form nhiều bước + validate + lưu Supabase ngay từ Phase 1 (không còn là "chỉ nút mở Zalo" nữa), kéo theo thời gian phát triển Phase 1 dài hơn ước tính ban đầu — xem điều chỉnh mục 8.6.

#### 6.3.1 Thông tin thanh toán chuyển khoản — ⚠️ SỐ ẢO/DEMO, CHƯA PHẢI THẬT

Dùng tạm để dựng demo/UI bước "Xác nhận" của form đặt hàng. **Bắt buộc thay bằng thông tin thật của chủ tiệm trước khi web lên chính thức** — nếu quên thay, khách chuyển khoản sẽ mất tiền vào tài khoản sai.

```
Ngân hàng: Vietcombank (demo)
Số tài khoản: 0000000000 (demo)
Chủ tài khoản: NGUYEN VAN DEMO (demo)
Nội dung chuyển khoản gợi ý: [Mã đơn] - [SĐT khách]
```

#### 6.3.2 Phí ship 5K/km — ảnh hưởng tới form đặt hàng

Phí ship tính theo khoảng cách (5K/km từ tiệm gần nhất: 60M Nguyễn Thông Q.3 hoặc Nguyễn Hữu Cảnh Bình Thạnh) khiến Bước 4 — Xác nhận của form (mục 6.3, Phương án B) **không thể chỉ cộng giá cố định**, cần tính khoảng cách thực tế. 2 hướng triển khai:

| Cách | Mô tả | Ưu/nhược |
|---|---|---|
| **A — Tự động qua Google Maps Distance Matrix API** | Khách nhập địa chỉ → hệ thống tự tính km từ tiệm gần nhất → ra phí ship ngay trên form | Chuyên nghiệp, khách thấy tổng tiền ngay; nhưng API này **tính phí theo lượt gọi** sau khi hết hạn mức miễn phí của Google — phát sinh chi phí vận hành nhỏ hàng tháng |
| **B — Chủ tiệm báo phí ship thủ công sau khi nhận đơn** | Form chỉ nhận địa chỉ, ghi chú "Phí ship tính theo khoảng cách thực tế, tiệm sẽ báo lại qua Zalo trước khi giao" — đơn vẫn lưu vào Supabase, chưa có tổng tiền cuối cùng ngay | Không tốn thêm chi phí API, nhưng khách chưa biết tổng tiền ngay lúc đặt (giống cách vận hành thủ công hiện tại) |

**Đề xuất cho Phase 1**: dùng **Cách B** trước (đỡ chi phí, đỡ phức tạp) — form ghi chú rõ phí ship sẽ báo lại, tiệm chủ động nhắn khách qua Zalo/Messenger để xác nhận phí trước khi giao. Có thể nâng cấp lên Cách A ở Phase 3 nếu khối lượng đơn tăng và cần tự động hoá.

**Khu vực giao hàng đã chốt**: Quận 1, Quận 3, Bình Thạnh (danh sách đầy đủ các quận/khu vực khác xác nhận thêm khi build — nếu khách nhập địa chỉ ngoài khu vực này, form nên hiện cảnh báo "Ngoài khu vực giao hàng, vui lòng liên hệ tiệm để được tư vấn" thay vì chặn hẳn).

**Bán kính giao tối đa và miễn phí ship theo mức đơn hàng**: chưa chốt, dự kiến gắn kèm chương trình khuyến mãi sau này (ví dụ "Miễn phí ship đơn từ X" có thể ra mắt như 1 campaign riêng) — Phase 1 tạm chưa áp dụng, chỉ tính phí ship 5K/km thuần túy.

### 6.4 Trang Giới thiệu / Quy trình — `/quy-trinh`
| # | Section | Heading | Nội dung |
|---|---|---|---|
| 1 | Hero | H1 | Câu chuyện thương hiệu Tiệm GỪNG |
| 2 | Quy trình làm mới mỗi ngày | H2 | Các bước từ nguyên liệu tươi đến thành phẩm |
| 3 | Hệ chai refill | H2 | Giải thích thủy tinh vs nhựa, hướng dẫn súc rửa chai khi gửi lại (theo đúng nội dung bài đăng thật) |
| 4 | Cam kết vệ sinh | H3 | Khử khuẩn bằng nước sôi trước khi tái sử dụng chai |
| 5 | CTA | — | "Xem sản phẩm" → `/san-pham` |

### 6.5 Trang Bí kíp / Blog sức khỏe — `/blog`
| # | Section | Heading | Nội dung |
|---|---|---|---|
| 1 | Hero | H1 | "Bí kíp GỪNG" hoặc tương tự |
| 2 | Danh sách bài viết | H2/H3 mỗi bài | Nội dung sức khỏe/eat clean tiệm đã có sẵn (vd. "6 cách ăn củ dền") |

**Cấu trúc 1 bài blog:**
- **Media đại diện**: ảnh bìa hoặc **video ngắn** (vd. video review/hướng dẫn) — cùng cơ chế với card sản phẩm, ảnh mặc định, video phát khi mở bài
- Tiêu đề + ngày đăng + thời gian đọc
- Nội dung bài viết (rich text, có thể chèn thêm ảnh/video trong thân bài)
- Tag chủ đề (vd. Detox, Eat Clean, Công thức)

**Ví dụ danh sách bài viết ban đầu** (dựa trên nội dung tiệm đã đăng):

| Bài viết | Media | Chủ đề |
|---|---|---|
| 6 cách ăn củ dền | Ảnh | Eat Clean |
| Bí quyết trẻ hơn 10 tuổi với Ginger 3 tháng | Ảnh | Detox |
| Vì sao nên refill chai sạch mỗi tuần | Ảnh | Hướng dẫn |
| Ginger nhà GỪNG được làm từ gì | Ảnh + video quy trình | Công thức |

### 6.5.1 Bản nháp nội dung 5 bài blog đầu tiên (viết lại từ bài đăng Facebook thật, giữ giọng "chị em")

Dùng làm dữ liệu khởi tạo cho bảng `posts` trong Supabase (schema mục 8.4, quản lý qua `/admin/blog` — mục 6.5.2) khi build Phase 2. Ảnh minh hoạ lấy từ kho 703 ảnh export cục bộ (mục 9.3).

---

**1. Uống nước ép củ dền đúng cách để cơ thể hấp thu tốt hơn**
`slug: uong-nuoc-ep-cu-den-dung-cach` · Tag: Eat Clean

Nhiều người nghĩ nước ép củ dền càng uống nhiều càng tốt. Thực ra, uống đúng cách mới là điều quan trọng.

🌱 **Nếu mới bắt đầu uống**: chỉ nên uống một lượng nhỏ để cơ thể làm quen, có thể kết hợp với chanh, táo hoặc gừng để hương vị dễ uống hơn và giảm cảm giác khó chịu.

🥤 **Mỗi lần uống**: không nên uống quá 250ml.

📅 **Tần suất**: chỉ nên uống 1-2 lần/tuần. Không nên uống mỗi ngày vì hàm lượng nitrat tự nhiên cao có thể khiến một số người chóng mặt hoặc tụt huyết áp nếu cơ thể chưa thích nghi.

🍎 **Kết hợp ngon và cân bằng hơn** — Tiệm GỪNG thường phối củ dền cùng gừng (thơm ấm, dễ uống), táo (ngọt thanh tự nhiên), cà rốt (bổ sung beta-carotene), cần tây (vị thanh mát).

🥛 Lưu ý nhỏ: không nên pha nước ép củ dền với sữa, vì có thể gây khó chịu cho hệ tiêu hóa ở một số người.

Tại Tiệm GỪNG, công thức luôn được phối theo tỷ lệ cân bằng — không phải ly có nhiều nguyên liệu nhất là ngon nhất, mà là ly phù hợp để cơ thể hấp thu và duy trì được lâu dài. 🌿

---

**2. Vì sao nhiều người uống Ginger Shot mỗi sáng lại thấy nhẹ bụng hơn?**
`slug: vi-sao-uong-ginger-shot-moi-sang` · Tag: Detox

Gừng trong Ginger Shot mang lại 2 lợi ích rõ nhất mà nhiều khách của Tiệm GỪNG phản hồi lại:

**Hỗ trợ tiêu hóa** 🌱 — gừng kích thích tiêu hóa, giảm đầy hơi, chướng bụng, giúp cơ thể nhẹ nhàng hơn sau bữa ăn.

**Chống viêm — hỗ trợ chuyển hóa** ⚡ — các hợp chất chống oxy hóa trong gừng giúp giảm viêm mạn tính mức độ thấp, tạo điều kiện thuận lợi cho quá trình chuyển hóa năng lượng.

Nhưng thật lòng, GỪNG không nghĩ Ginger Shot là "thuốc" hay uống một chai là khỏe ngay. Nhiều người thấy hiệu quả rõ rệt không chỉ nhờ gừng, mà vì khi bắt đầu thói quen uống mỗi sáng, họ cũng đồng thời: uống đủ nước hơn, ăn sáng đều hơn, hạn chế nước ngọt, ít ăn vặt hơn, chủ động chăm sóc sức khỏe hơn.

Chính những thay đổi nhỏ này, kết hợp cùng tác dụng hỗ trợ của gừng, mới tạo nên kết quả bền vững. Một chai Ginger Shot nhỏ mỗi ngày, uống cùng chế độ ăn cân bằng, ngủ đủ và vận động đều — là một cách nhỏ để chủ động quan tâm đến cơ thể hơn. 🍋🫚

---

**3. Trà Kombucha có lợi khuẩn từ đâu? Bí mật nằm ở quá trình lên men**
`slug: kombucha-loi-khuan-tu-dau` · Tag: Công thức

🫧 Kombucha được tạo ra từ trà, đường và hệ cộng sinh vi sinh vật SCOBY (Symbiotic Culture of Bacteria and Yeast).

Trong quá trình lên men, nấm men và vi khuẩn có lợi cùng hoạt động, tạo nên những hợp chất đặc trưng làm nên hương vị chua thanh, sảng khoái rất riêng của Kombucha.

Điều làm Kombucha trở nên đặc biệt là những lợi khuẩn này **không được bổ sung từ bên ngoài**, mà được tạo ra tự nhiên nhờ quá trình lên men sống — đúng tinh thần "làm mới mỗi ngày" mà Tiệm GỪNG theo đuổi.

Một lon Kombucha không chỉ là thức uống giải khát, mà còn là thành quả của hàng tuần lên men tự nhiên và sự chuyển hóa kỳ diệu của hệ SCOBY. 💛

---

**4. 4 kiểu "tiết kiệm" khiến sức khỏe âm thầm trả giá**
`slug: 4-kieu-tiet-kiem-vo-dung-suc-khoe` · Tag: Sống khỏe

Có những khoản tiền mình tưởng là đang tiết kiệm... nhưng thật ra chỉ là đang để dành cho bệnh viện. 🥲

1️⃣ **Không dám ăn ngon, không dám chăm sóc bản thân** — tiền thì giữ được, nhưng sức khỏe cứ âm thầm đi xuống, đến lúc bệnh thì tiền tích góp lại lần lượt mang đi khám chữa bệnh.

2️⃣ **Cố ăn hết đồ hư vì tiếc** — ăn hết quả hỏng, quả tươi lại tiếp tục hỏng, một vòng luẩn quẩn. Mua ít hơn một chút nhưng ăn tươi — ăn đủ — ăn đều, cơ thể được chăm sóc tốt hơn nhiều.

3️⃣ **Đồ ăn quá hạn cũng không nỡ vứt** — tiền không mất vì bỏ đồ ăn, tiền mất nhiều hơn khi sức khỏe bắt đầu có vấn đề.

4️⃣ **Cố làm, cố chịu, cố "tiết kiệm" sức khỏe** — làm việc quá sức, ngồi sai tư thế, thức khuya, bỏ bữa, không vận động. Đến một ngày cơ thể lên tiếng, muốn khỏe lại không còn đơn giản như lúc giữ gìn từ đầu.

🌱 Sức khỏe cũng cần được chăm mỗi ngày — không cần bắt đầu bằng điều gì quá lớn lao, chỉ cần mỗi ngày tiện hơn một chút để duy trì lâu hơn. 🌿

---

**5. Detox không phải là nhịn ăn — mà là quay lại với điều cơ thể thật sự cần**
`slug: detox-khong-phai-la-nhin-an` · Tag: Detox

Mỗi khi công việc quá nhiều, áp lực chồng áp lực, nhiều người ăn uống rất thất thường — bỏ bữa, uống trà sữa/cà phê, ăn đồ ngọt để lấy năng lượng. Chỉ sau vài ngày, cơ thể bắt đầu lên tiếng: bụng nặng hơn, người uể oải, da xỉn màu, sáng dậy vẫn mệt dù ngủ đủ.

Với Tiệm GỪNG, **detox không phải là nhịn ăn hay ép cân**. Detox đơn giản là quay lại với những điều cơ thể thật sự cần: uống đủ nước, bổ sung nhiều rau xanh và trái cây, hạn chế đồ ăn chế biến sẵn, giảm đường, giảm dầu mỡ và để hệ tiêu hóa có một khoảng nghỉ.

Đừng kỳ vọng một phép màu chỉ sau vài ngày. Nhưng nếu kết hợp detox với chế độ ăn cân bằng và vận động hợp lý, cơ thể sẽ nhẹ nhàng hơn, hình thành thói quen tốt hơn và có thêm động lực để tiếp tục hành trình chăm sóc sức khỏe.

Mỗi tháng, hãy dành ít nhất 7 ngày để yêu lại cơ thể của mình. Thương mình một chút, cơ thể sẽ biết cách cảm ơn bạn. 🌿💚

---

### 6.5.2 Vấn đề cần giải quyết: ai viết bài blog mới sau khi web đã lên?

Kiến trúc hiện tại (mục 8.1-8.2) dùng **Astro Content Collections** — mỗi bài blog là 1 file `.md` trong `src/content/blog/`. Cách này **không phù hợp** nếu chủ tiệm muốn tự đăng bài sức khỏe định kỳ như vẫn đang làm trên Facebook, vì mỗi bài mới đòi hỏi:

1. Có người tạo file `.md` mới (cần biết Git/code)
2. Chạy lại `npm run build`
3. Upload lại `dist/` lên hosting qua FTP/File Manager

Tức là **chủ tiệm không tự đăng được** — phải nhờ dev mỗi lần, khác hẳn việc gõ và đăng trực tiếp trên Facebook.

**Đã chốt: Phương án A** — Blog quản lý qua Supabase + trang admin viết bài. Thêm 1 bảng `posts` trong Supabase (cùng project đã dùng cho đơn hàng), làm 1 trang `/admin/blog` (chỉ chủ tiệm đăng nhập được, dùng chung tài khoản Supabase Auth với `/admin/don-hang` và `/admin/san-pham` — xem mục 6.2.2) có ô nhập tiêu đề/nội dung/ảnh — bấm Đăng là lên `/blog` ngay, **không cần build lại/deploy lại code**. Phù hợp vì chủ tiệm đăng bài khá thường xuyên (gần như hằng ngày trên Facebook), muốn tự chủ đăng bài như thói quen hiện tại thay vì nhờ dev mỗi lần.

- Không cần khóa nội dung như bản gốc `/bi-kip` trừ khi Tiệm GỪNG có ý định bán khóa học riêng

### 6.6 Trang Liên hệ — `/lien-he`
| # | Section | Heading | Nội dung |
|---|---|---|---|
| 1 | Hero | H1 | "Liên hệ Tiệm GỪNG" |
| 2 | Thông tin liên hệ | H3 | 2 địa chỉ (60M Nguyễn Thông, Q.3 · Nguyễn Hữu Cảnh, Bình Thạnh) + Google Maps, Hotline/Zalo (0888 267 009), Email, giờ hoạt động 7:00-22:00 |
| 3 | Social | — | Facebook, Instagram |
| 4 | CTA | — | Nút "Chat Zalo" / "Nhắn Messenger" |

### 6.7 Trang Thành viên — `/thanh-vien` (Phase 2, cân nhắc)
| # | Section | Heading | Nội dung |
|---|---|---|---|
| 1 | Đăng nhập/Đăng ký | H1 | Form đăng nhập bằng SĐT hoặc email (dùng Supabase Auth) |
| 2 | Lịch sử đơn hàng | H2 | Danh sách đơn đã đặt, trạng thái, ngày giao |
| 3 | Ưu đãi thành viên | H2 | Nếu triển khai chương trình tích điểm/ưu đãi khách quen — hợp lý vì mô hình combo thuê bao vốn đã có khách lặp lại |

*Chỉ nên làm khi đã có Phương án B (mục 6.3) chạy ổn định, vì cần cùng 1 hệ thống tài khoản với đặt hàng.*

## 7. Việc cần chốt trước khi build

- [x] **Xử lý "Thiếu hồ sơ" cho domain `gungdetox.com`** trên portal.inet.vn — domain đã "Đang hoạt động" (hết hạn 17/08/2027)
- [x] **Chọn Phương án A hay B cho chức năng Đặt hàng** (mục 6.3) — đã chốt **Phương án B** (form tự phục vụ nhiều bước)
- [x] Xác nhận có muốn tra cứu đơn bằng SĐT ngay từ Phase 1 không (mục 6.3) — **có**, làm ngay từ Phase 1 (đã có trong 8.7)
- [x] Giá bán lẻ từng loại đồ uống, giờ hoạt động (7:00-22:00), ảnh/video sản phẩm thật — đã bổ sung từ export Facebook, xem mục 9. Còn thiếu: giá lẻ đầy đủ cho từng vị Kombucha/Matcha cụ thể (mới có giá combo/1 vị)
- [x] Xác nhận giữ hay bỏ phần "Bí kíp" dạng bán khóa học — **bỏ**, không cần, dùng `/blog` miễn phí là đủ
- [x] Xác nhận có làm trang Thành viên/tích điểm (mục 6.7) hay để sau — **để sau**, từ Phase 3 trở đi
- [x] Xác nhận kênh đặt hàng chính (Zalo hay Facebook Messenger) để đặt CTA cho đúng — **cả hai ngang nhau**, hiển thị 2 nút CTA song song (Chat Zalo / Nhắn Messenger) ở widget nổi, trang chủ và Liên hệ
- [x] Duyệt hướng màu sắc/font trước khi dựng bản demo — **đã chốt theo logo thật**: xanh lá rừng đậm + nâu đậm + đỏ mận (accent) + nền trắng/kem nhạt, font Fraunces + Be Vietnam Pro, xem mục 5
- [x] Đối chiếu lại toàn bộ thông tin sau khi có file export từ Meta Business Suite — xong, xem mục 9
- [x] Duyệt đề xuất công nghệ ở mục 8.1 — đã chốt **Astro + Supabase**
- [x] **Chọn cách quản lý Blog** (mục 6.5.2) — đã chốt **Phương án A**: Supabase + trang admin `/admin/blog` tự đăng bài, không cần nhờ dev
- [x] **Sản phẩm cũng chuyển sang quản lý qua Supabase + trang admin `/admin/san-pham`** (mục 6.2.2, thay đổi kiến trúc mới) — thay vì hard-code/tra cứu giá lẻ Kombucha/Matcha ngay bây giờ, Phase 1 chỉ cần dữ liệu demo, chủ tiệm tự bổ sung/sửa giá thật sau khi web đã lên
- [x] Bỏ hiển thị mã hộ kinh doanh ở footer (không cần) — mục 6.1, 10.1
- [x] Bỏ testimonial gắn tên khách hàng thật (khỏi cần xin phép từng khách) — thay bằng 1 quote thương hiệu đơn giản — mục 6.1, 10.1
- [x] Xác nhận **tên thương hiệu chính thức cho website** — **GỪNG DETOX** (khớp domain, dùng cho logo/header/pháp lý), "Tiệm GỪNG" giữ làm giọng văn thân mật trong nội dung — xem mục 1, 5
- [x] Xác nhận giá **"5 SET DETOX TỰ NHIÊN"** (160-170K/set) — **thay thế hoàn toàn** "Combo Detox Juice 7 ngày 399K" cũ, không dùng giá 399K nữa — xem mục 6.2.1, 9.1
- [x] Phí ship: **5K/km** (tính từ tiệm gần nhất — 60M Nguyễn Thông Q.3 hoặc Nguyễn Hữu Cảnh Bình Thạnh, chọn điểm gần hơn). Khu vực giao: **Quận 1, Quận 3, Bình Thạnh** (và các quận lân cận tương tự — xác nhận thêm danh sách đầy đủ khi build). Bán kính tối đa + miễn phí ship theo mức đơn hàng: **để sau, sẽ gắn kèm chương trình khuyến mãi** — xem mục 6.3.2
- [ ] ⚠️ Thông tin chuyển khoản hiện đang là **SỐ ẢO/DEMO** (xem mục 6.3.1) — **bắt buộc thay bằng thông tin thật trước khi lên site chính thức**, nếu không khách sẽ chuyển tiền vào tài khoản sai
- [x] Nghĩa vụ **thông báo website bán hàng với Bộ Công Thương** (thongbao.online.gov.vn) — Tiệm GỪNG **đã có hộ kinh doanh/doanh nghiệp**, nên cần làm thủ tục thông báo website tại thongbao.online.gov.vn trước khi vận hành chính thức (theo Nghị định 52/2013 & 85/2021). Cần chuẩn bị: mã số thuế/giấy chứng nhận đăng ký hộ kinh doanh, thông tin website (domain `gungdetox.com`), thông tin chủ sở hữu — việc này chủ tiệm tự làm trên cổng thongbao.online.gov.vn, không nằm trong phạm vi code website

## 8. Kế hoạch kỹ thuật chi tiết

### 8.1 Lựa chọn công nghệ (đã chốt)
- **Framework**: **[Astro](https://astro.build)** cho phần khung/layout trang (chủ, sản phẩm, blog, giới thiệu, liên hệ, form đặt hàng) kết hợp **Supabase** (Postgres + Auth + Storage, có gói miễn phí) làm backend cho **toàn bộ nội dung động**: sản phẩm (`products`), blog (`posts`), đơn hàng (`orders`), tra cứu đơn bằng SĐT, (Phase 3) tài khoản Thành viên
  - Đây là kiến trúc gần giống với mexoaikechuyen.vn (vốn dùng Lovable + khả năng cao là Supabase phía sau), nhưng code tay bằng Astro thay vì dùng nền tảng AI builder, để chủ động kiểm soát mã nguồn và chi phí dài hạn
  - Đã cân nhắc Next.js nhưng không chọn: Next.js cần server Node.js chạy liên tục cho các tính năng nâng cao (giấu API key, SSR phức tạp) mà dự án hiện không cần — trong khi Astro xuất ra file tĩnh, chạy tốt trên gói Web Hosting iNET đã mua, không phát sinh chi phí VPS. Mọi tương tác động (đặt hàng, tra cứu đơn, quản lý sản phẩm/blog qua admin, đăng nhập Thành viên sau này) đều gọi thẳng Supabase từ trình duyệt, không phụ thuộc vào việc dùng Astro hay Next.js
  - Nếu Phase 3 cần thanh toán online (VNPay/Momo) đòi hỏi giấu secret key phía server, có thể bổ sung 1 Cloud Function/serverless riêng lúc đó thay vì đổi cả framework
- **Styling**: CSS thuần theo đúng design system đã chốt (font Fraunces + Be Vietnam Pro, palette theo logo thật) — không dùng thư viện UI có sẵn để giữ đúng bản sắc thương hiệu
- **⚠️ Thay đổi quan trọng so với bản nháp đầu tiên**: Sản phẩm và Blog **không còn dùng file tĩnh** (Astro Content Collections) — cả 2 đều quản lý qua Supabase với trang admin riêng (`/admin/san-pham`, `/admin/blog`), để chủ tiệm tự thêm/sửa nội dung mà không cần dev sửa code mỗi lần (mục 6.2.2, 6.5.2). Chỉ có khung giao diện (layout, component) là code tĩnh trong Astro — dữ liệu hiển thị đều fetch từ Supabase lúc trang tải
- **Backend cho đặt hàng/tra cứu đơn**: 1 bảng `orders` trong Supabase, cập nhật trạng thái qua trang quản trị nội bộ đơn giản (route riêng, chỉ chủ tiệm đăng nhập được) — không cần xây hệ thống giỏ hàng phức tạp
- **3 trang admin dùng chung 1 tài khoản đăng nhập** (Supabase Auth): `/admin/don-hang`, `/admin/san-pham`, `/admin/blog` — xem mục 6.2.2

### 8.2 Cấu trúc thư mục dự án (đề xuất)
```
gungdetox/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ProductCard.astro
│   │   ├── ComboCard.astro
│   │   ├── SetDetoxCard.astro   (5 SET DETOX TỰ NHIÊN — mục 6.2.1)
│   │   ├── BlogCard.astro
│   │   ├── ZaloButton.astro
│   │   └── OrderLookup.astro
│   ├── pages/
│   │   ├── index.astro          → /
│   │   ├── san-pham.astro       → /san-pham
│   │   ├── dat-hang.astro       → /dat-hang (đặt + tra cứu đơn)
│   │   ├── quy-trinh.astro      → /quy-trinh
│   │   ├── lien-he.astro        → /lien-he
│   │   ├── thanh-vien.astro     → /thanh-vien (Phase 2)
│   │   ├── admin/
│   │   │   ├── don-hang.astro   → quản trị đơn hàng (nội bộ, cần đăng nhập)
│   │   │   ├── san-pham.astro   → thêm/sửa/xoá sản phẩm (nội bộ, cần đăng nhập)
│   │   │   └── blog.astro       → viết/đăng bài blog (nội bộ, cần đăng nhập)
│   │   └── blog/
│   │       ├── index.astro      → /blog (fetch bài viết từ Supabase, không phải file tĩnh)
│   │       └── [slug].astro     → /blog/:slug
│   ├── lib/
│   │   └── supabase.ts          (kết nối Supabase client)
│   └── styles/
│       └── global.css
├── public/
│   ├── images/
│   └── videos/
├── astro.config.mjs
└── package.json
```

### 8.3 Data schema — Bảng `products` (Supabase — dùng chung cho sản phẩm lẻ, combo thuê bao, 5 Set Detox — mục 6.2.2)
```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('single','combo','set')),
  name text not null,
  category text,                 -- 'ginger-shot' | 'bia-gung' | 'juice' | 'smoothie' | 'sua-hat' | 'kombucha' | 'matcha' | 'cu-den'
  description text,
  origin_story text,             -- 1-2 câu nguồn gốc (mục 6.2 cấu trúc card)
  volume text,                   -- vd. "30ml/lần", "330ml"
  price_retail numeric,          -- giá lẻ (sản phẩm type='single')
  price numeric,                 -- giá trọn gói (type='combo'/'set')
  servings int,                  -- số lần uống/số chai trong gói
  delivery_schedule text,        -- vd. "4 đợt/tuần"
  bottle_options text[],         -- ['glass','plastic']
  set_goal text,                 -- mục tiêu sức khỏe, chỉ dùng cho type='set' (vd. "Thải độc – Làm mát – Giảm đầy bụng")
  color_theme text,              -- màu badge cho Set Detox (mục 11.2 SetDetoxCard)
  badge text check (badge in ('best-seller','new','sale','out-of-stock')),
  image_url text,
  video_url text,
  in_stock boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);
```
Dữ liệu khởi tạo (demo/placeholder cho Phase 1) lấy từ bảng giá thật ở mục 9.1 và mục 6.2.1 — chủ tiệm bổ sung/chỉnh sửa dần qua `/admin/san-pham` sau khi lên site, đặc biệt là giá lẻ từng vị Kombucha/Matcha còn thiếu.

### 8.4 Data schema — Bảng `posts` (Supabase — quản lý qua `/admin/blog`, mục 6.5.2)
```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  body text not null,            -- rich text/markdown
  tag text,                      -- 'eat-clean' | 'detox' | 'huong-dan' | 'cong-thuc' | 'song-khoe'
  image_url text,
  video_url text,
  read_time text,                -- vd. "4 phút" (có thể tính tự động từ độ dài body thay vì nhập tay)
  published_at timestamptz default now()
);
```
5 bài nháp ở mục 6.5.1 dùng làm dữ liệu khởi tạo — chủ tiệm đăng thêm bài mới trực tiếp qua `/admin/blog`, không cần sửa code.

### 8.5 Data schema — Đơn hàng (bảng Supabase `orders`)
```json
{
  "id": "uuid",
  "phone": "090xxxxxxx",
  "customerName": "Nguyễn Thị A",
  "items": [
    { "productSlug": "combo-thang", "bottleType": "glass", "quantity": 1 }
  ],
  "bottlesReturned": 0,
  "status": "processing",
  "statusHistory": [
    { "status": "processing", "at": "2026-08-17T10:00:00Z" }
  ],
  "createdAt": "2026-08-17T10:00:00Z"
}
```
`status` gồm: `processing` (đang xử lý) · `delivering` (đang giao) · `delivered` (đã giao) · `cancelled` (đã huỷ)

`bottlesReturned`: số chai cũ khách trả lại kèm đơn này — dùng để cộng dồn ưu đãi đổi/hoàn chai (mục 6.2, ý tưởng từ Lady Kombucha ở mục 10). Tra cứu bằng SĐT (mục 6.3) cộng dồn `bottlesReturned` theo `phone` để hiển thị tổng số chai đã trả — chưa cần bảng riêng, chỉ cần query tổng từ bảng `orders` theo SĐT.

### 8.6 Các giai đoạn phát triển (đề xuất)

**Phase 1 — MVP với đặt hàng tự phục vụ (Phương án B) (4-5 tuần, dài hơn ước tính ban đầu vì đã chốt Phương án B thay vì A)**
- Trang chủ, Sản phẩm, Giới thiệu, Liên hệ với nội dung/ảnh thật
- **Sản phẩm quản lý qua Supabase + `/admin/san-pham`** (mục 6.2.2) — dữ liệu khởi tạo là demo/placeholder, chủ tiệm bổ sung giá lẻ Kombucha/Matcha sau
- **Đặt hàng theo Phương án B**: form 4 bước (Sản phẩm → Tuỳ chọn → Thông tin giao hàng → Xác nhận) + trang cảm ơn, đơn tự lưu vào Supabase, gửi thông báo cho chủ tiệm qua email/Zalo API
- **Tra cứu đơn bằng SĐT** + trang quản trị đơn hàng nội bộ đơn giản (Supabase)
- Deploy lên **Web Hosting iNET** (đã mua sẵn, cùng domain — mục 8.8), không dùng Vercel/Netlify

**Phase 2 — Blog + SEO + Thành viên (tuỳ chọn)**
- Trang Blog quản lý qua Supabase + `/admin/blog` (đã chốt Phương án A, mục 6.5.2) — 5 bài viết đầu dùng bản nháp ở mục 6.5.1 làm dữ liệu khởi tạo
- Thêm meta title/description, Open Graph image cho từng trang
- Đăng ký Google Search Console

**Phase 3 — Mở rộng (khi có nhu cầu)**
- Trang Thành viên (đăng nhập, lịch sử đơn hàng) — dùng Supabase Auth, thuận lợi vì đã có sẵn dữ liệu đơn hàng từ Phương án B
- Tích điểm/ưu đãi khách quen gắn với tài khoản Thành viên
- Thanh toán online (VNPay/Momo) nếu cần

### 8.7 SEO & hiệu năng — checklist
- [ ] Mỗi trang có title/description riêng, tiếng Việt có dấu chuẩn
- [ ] Ảnh nén, định dạng WebP; video có ảnh poster tĩnh trước khi phát
- [ ] `sitemap.xml` + `robots.txt`
- [ ] Schema.org LocalBusiness (địa chỉ, giờ mở cửa, số điện thoại) để hiện tốt trên Google Maps/Search
- [ ] Kiểm tra responsive trên mobile — khách chủ yếu thao tác/đặt hàng qua điện thoại

### 8.8 Hosting & triển khai — dùng dịch vụ iNET (portal.inet.vn)

**Tình trạng domain hiện tại**: `gungdetox.com` đã "Đang hoạt động" (còn hạn tới 17/08/2027). DNS đã trỏ xong: bản ghi `A` cho `@` và `www` đều trỏ về IP hosting `202.92.7.88`. Domain đã kết nối với hosting — bước tiếp theo là build code và upload lên hosting này.

**Hosting đề xuất**: dùng **Web Hosting** của iNET (chạy trên OnePanel) thay vì Vercel/Netlify, vì:
- Domain đã cùng nhà cung cấp → không cần đổi nameserver, quản lý tập trung 1 chỗ
- Astro build ra output **tĩnh** (`dist/` — HTML/CSS/JS thuần) theo mặc định, không cần server Node.js — hoàn toàn chạy tốt trên shared hosting cơ bản của iNET, upload qua File Manager/FTP trên OnePanel
- Phần "động" (tra cứu đơn bằng SĐT, sau này là tài khoản Thành viên) vẫn dùng **Supabase** như đã chốt ở mục 8.1 — Supabase là dịch vụ cloud độc lập, gọi thẳng từ JavaScript phía trình duyệt, **không phụ thuộc vào việc frontend host ở đâu**, nên vẫn dùng được dù chuyển từ Vercel sang iNET
- Nếu sau này (Phase 3) cần server riêng xử lý logic phức tạp hơn (vd. gọi Zalo API tự động, xử lý thanh toán online), có thể nâng cấp lên **Cloud Server (VPS)** của iNET để chạy Node.js — không bắt buộc ở giai đoạn đầu

**Quy trình triển khai**:
1. Xử lý xong "Thiếu hồ sơ" cho domain `gungdetox.com`
2. Đăng ký gói Web Hosting phù hợp trên portal.inet.vn (dung lượng nhỏ là đủ vì site tĩnh + Supabase, không cần cấu hình cao)
3. Trỏ domain `gungdetox.com` về gói hosting đó (cùng portal nên thao tác trong vài bước)
4. Build Astro (`npm run build`) → thư mục `dist/` → tải lên hosting qua File Manager/FTP trên OnePanel
5. Cấu hình SSL miễn phí (Let's Encrypt) cho domain qua OnePanel/OneShield nếu chưa tự động bật

## 9. Dữ liệu thực tế bổ sung từ export Facebook (đối chiếu 11/09/2026)

Đã đối chiếu 2 nguồn: file CSV thống kê bài đăng (`Jun-10-2026_Sep-07-2026_...csv`, 10/06-07/09/2026) và file export toàn bộ trang Facebook (`facebook-gungdetox-11_09_2026-8rgEldK3/`). Thông tin dưới đây thay thế các chỗ "chờ giá/chờ mô tả" ở mục 1 và 6.2.

### 9.1 Bảng giá đầy đủ (trích từ nội dung bài đăng thật)

| Sản phẩm | Đơn vị | Giá |
|---|---|---|
| Juice ép tươi (21 vị, J1-J21) | 1 chai | 69K |
| Juice — Combo 7 chai (330ml) | 1 tuần | 399K |
| Smoothies đông lạnh (18-20 vị) | 1 gói | 49K |
| Smoothies — Combo 10 gói | — | 490K |
| Smoothies — Combo 20 gói | tặng 2 gói | 980K |
| Sữa hạt tươi | 1 chai | 79K |
| Sữa hạt — Combo 7 gói (tự pha) | 1 tuần | 315K |
| Sữa hạt — Combo 7 chai (350ml, uống ngay) | 1 tuần | 483K |
| Bia Gừng (Ginger Beer) | 1 lon | 49K |
| Bia Gừng — lốc 6 lon | — | 210K (~35K/lon) |
| Kombucha — combo 6 lon đủ vị | 1 lốc | 270K |
| Coco Matcha | 1 chai | 79K |
| Củ Dền Gừng ngâm | 1 hũ | 199K |
| Ginger Shot — combo tháng | 28 lần uống (30ml/lần) | 500-550K |
| Ginger Shot — combo 3 tháng | 84 lần uống | 1.500K |
| Detox 1 ngày (5 chai theo khung giờ) | 1 ngày | 269K |
| ~~Combo Detox Juice 7 ngày — 399K~~ | ⚠️ **ĐÃ NGƯNG DÙNG** | Thay thế bởi "5 SET DETOX TỰ NHIÊN" (160-170K/set, 7 chai thủy tinh) — xem mục 6.2.1. Giữ dòng này lại chỉ để ghi chú lịch sử, **không đưa lên site** |

Lưu ý: một số bài đăng ghi combo Ginger 3 tháng là 1.500K, có 1 bài ghi 1.800K kèm quà tặng smoothie — cần **hỏi lại chủ tiệm giá chính xác hiện hành** trước khi đưa lên site chính thức.

### 9.2 Thông tin vận hành bổ sung
- **Giờ hoạt động**: 7:00 – 22:00 hằng ngày, nghỉ ngày 30 hàng tháng để dọn dẹp/chuẩn bị
- **2 địa điểm**: 60M Nguyễn Thông (Q.3) và Nguyễn Hữu Cảnh (Bình Thạnh)
- **Không hỗ trợ GrabFood** — giá trên app cao hơn 30-40% so với đặt trực tiếp, nên site cần nêu rõ kênh đặt hàng chính thức (Zalo/Messenger/hotline) để tránh khách nhầm lẫn
- **Group Zalo khách quen**: https://zalo.me/g/fpboqw423 — có thể cân nhắc thêm link này vào trang Liên hệ/Footer
- Có mảng **nhượng quyền mô hình tiệm trái cây/juice** (B2B, vốn dưới 20 triệu) chạy song song — ngoài phạm vi site khách lẻ này

### 9.3 Kho ảnh/video sản phẩm thật (đã có sẵn, khỏi cần chụp lại)
Trong `facebook-gungdetox-11_09_2026-8rgEldK3/this_profile's_activity_across_facebook/posts/media/` có **703 ảnh + 32 video** thật từ các bài đăng — đủ để làm media cho trang Sản phẩm, Blog, Trang chủ mà không cần chụp mới ngay từ Phase 1.

### 9.4 ⚠️ Lưu ý bảo mật quan trọng — dữ liệu riêng tư khách hàng
Cùng trong file export đó có thư mục `messages/inbox/` chứa **608 cuộc trò chuyện Messenger riêng tư với khách hàng thật** (tên, có thể kèm SĐT/địa chỉ trong nội dung chat). Đây là dữ liệu cá nhân của bên thứ ba, **không được**:
- Đưa vào code/nội dung website
- Commit lên Git (đặc biệt vì repo đã kết nối remote `https://github.com/buitheu2206/gungdetox.git`)

**Cần làm ngay**: thêm vào `.gitignore` của repo:
```
*.csv
facebook-gungdetox-*/
```
để tránh vô tình push dữ liệu riêng tư khách hàng lên GitHub.

## 10. Đối thủ cạnh tranh & ý tưởng bổ sung (khảo sát 11/09/2026)

Đã xem qua website của 3 thương hiệu cùng ngành juice/ginger shot/kombucha detox tại VN: **Légumes** (legumesvn.com), **Lady Kombucha** (ladykombucha.com), **Origin Việt Nam** (originvn.com). Ngoài ra ghi nhận các đối thủ khác cùng mô hình giao juice theo tuần tại TP.HCM: EP Pressed Juice, Conic, Coco Sumer, Farmers Market Vietnam, Vgreen, Komboo, Star Kombucha.

### 10.1 Các ý tưởng từ đối thủ đã đưa thẳng vào plan (không liệt kê lại ở đây)

Các ý tưởng rút ra từ 3 đối thủ trên đã được chỉnh trực tiếp vào wireframe/schema, không để riêng thành ghi chú:
- Chương trình đổi/hoàn chai cũ → mục 6.2 (section 5) + schema `bottlesReturned` mục 8.5
- Tra cứu điểm tích lũy chung form tra cứu đơn → mục 6.3 (section 5)
- Nhãn "Sale" → mục 6.2 (cấu trúc card) + schema `badge` mục 8.3
- Icon thanh toán ở footer → mục 6.1 (section 9)
- CTA "Đặt cho văn phòng" → mục 6.2 (section 7 mới)
- Storytelling nguồn gốc sản phẩm trong card → mục 6.2 (cấu trúc card)

**Đã huỷ (theo yêu cầu chủ tiệm)**: hiển thị mã hộ kinh doanh ở footer (không cần); testimonial gắn tên khách hàng thật (bỏ, khỏi phải xin phép từng khách — thay bằng 1 quote thương hiệu đơn giản, mục 6.1 section 7).

### 10.2 Đối chiếu giá thị trường
Một vài dịch vụ juice giao tuần khác tại TP.HCM có mức giá tham khảo: chai 550ml ~40K, chai 330ml ~28K, gói 14 ngày (2 chai/ngày) hơn 1 triệu. So với Tiệm GỪNG (Juice 69K/chai lẻ, chưa rõ dung tích chuẩn — combo 7 chai 330ml/399K ≈ 57K/chai), mức giá **tương đương hoặc nhỉnh hơn** — không phải yếu tố cạnh tranh về giá, nên tiếp tục nhấn mạnh **chất lượng/tính minh bạch nguyên liệu** làm điểm khác biệt thay vì cạnh tranh giá rẻ.

### 10.3 Điều KHÔNG nên bắt chước
- Origin VN không hiển thị giá công khai (đẩy qua Shopee) — Tiệm GỪNG nên **giữ giá rõ ràng ngay trên site** như đã chốt, vì đây là điểm cộng lớn cho trải nghiệm khách so với đối thủ.
- Nhiều dịch vụ nhỏ lẻ trôi nổi trên thị trường **thiếu giấy chứng nhận an toàn thực phẩm** (theo báo Tuổi Trẻ) — càng cho thấy việc hiển thị rõ hộ kinh doanh/chứng nhận (mục 10.1) là lợi thế cạnh tranh thật sự, không chỉ là thủ tục pháp lý.

Sources:
- [Légumes Vietnam](https://legumesvn.com)
- [Lady Kombucha](https://ladykombucha.com)
- [Origin Việt Nam](https://originvn.com)
- [Đa dạng nước ép giao tận nhà cho bạn ở TP.HCM - Thanh Niên](https://thanhnien.vn/da-dang-nuoc-ep-giao-tan-nha-cho-ban-o-tphcm-185677147.htm)
- [Nước detox nổ tung trời, thực hư ra sao? - Tuổi Trẻ](https://tuoitre.vn/nuoc-detox-no-tung-troi-thuc-hu-ra-sao-20220522085119466.htm)

## 11. Task breakdown chi tiết để triển khai Phase 1 (tách nhỏ theo từng bước/file)

Mục này tách Phase 1 (mục 8.6) thành các đơn vị công việc nhỏ, có thứ tự rõ ràng, để khi bắt đầu build có thể giao/thực hiện từng việc một mà không cần suy nghĩ lại kiến trúc. Mỗi bước lớn (11.x) nên hoàn thành trước khi qua bước sau, vì bước sau thường phụ thuộc bước trước.

### 11.0 Bước 0 — Khởi tạo project & hạ tầng nền ✅ XONG (11/09/2026)
- [x] Tạo project Astro mới (`npm create astro@latest`), dọn theo đúng cấu trúc thư mục mục 8.2 — build + dev server đã xác nhận chạy đúng
- [x] Tạo project Supabase mới — project `gungdetox`, ref `bjenawwpxwivocsmsmzd`, region thực tế là **Tokyo** (không phải Singapore như đề xuất — chọn nhầm lúc tạo, chấp nhận được, không đáng để tạo lại)
- [x] Tạo file `.env` chứa `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` (đổi tên có tiền tố `PUBLIC_` theo đúng quy ước Astro để dùng được ở client) + `SUPABASE_SERVICE_ROLE_KEY` (chỉ dùng cho script cục bộ, không dùng trong code web) — đã xác nhận nằm trong `.gitignore`
- [x] Copy `icon.jpg` → `public/images/brand/logo.jpg`, `anh bìa.jpg` → `public/images/brand/cover-5-set-detox.jpg`
- [x] Tạo favicon từ `icon.jpg` bằng `sharp` (favicon-32.png, apple-touch-icon.png) thay vì công cụ web ngoài
- [x] Đăng ký font Fraunces + Be Vietnam Pro trong `BaseLayout.astro`
- [x] Khởi tạo `src/styles/global.css` với design tokens (giữ nguyên mã hex ước lượng ở 11.0.1, **vẫn cần lấy lại bằng color picker thật trước khi chốt thiết kế cuối**)

#### 11.0.1 Design tokens đề xuất (giá trị cụ thể để code, chỉnh lại khi có bảng màu chính xác từ file gốc)
```css
:root {
  --color-primary: #1b4d2e;      /* xanh lá rừng đậm — lấy từ viền logo icon.jpg */
  --color-primary-dark: #0f331d; /* hover/active state */
  --color-secondary: #4a2c1a;    /* nâu đậm — chữ "GỪNG" trong logo */
  --color-accent: #7a1f2b;       /* đỏ mận — nước ép beetroot / Set 3 Đỏ Giảm Cân */
  --color-bg: #fffdf8;           /* nền trắng/kem rất nhạt — theo nền logo/ảnh bìa */
  --color-bg-alt: #f5f0e6;       /* nền phụ cho card/section xen kẽ */
  --color-text: #2a2a2a;
  --font-display: 'Fraunces', serif;
  --font-body: 'Be Vietnam Pro', sans-serif;
}
```
⚠️ Các mã hex trên là **ước lượng bằng mắt** từ mô tả ảnh, không phải lấy bằng công cụ hút màu (color picker) chính xác — bước đầu tiên khi code nên mở `icon.jpg` bằng công cụ hút màu thật (Photoshop/Figma/eyedropper) để lấy đúng mã hex trước khi đưa vào code chính thức.

### 11.1 Bước 1 — Supabase: tạo bảng & phân quyền (SQL cụ thể) ✅ XONG (11/09/2026)
SQL đầy đủ đã lưu tại `supabase/schema.sql`, chạy qua Supabase Management API (không cần mật khẩu DB). Đã kiểm chứng bằng script thật: RLS chặn đúng (anon không insert được `products`, insert được `orders`), tài khoản admin đăng nhập được và sau khi đăng nhập insert `products` thành công, 2 storage bucket tồn tại. Dữ liệu demo (15 sản phẩm + 5 bài blog) đã seed qua `supabase/seed.mjs` và đọc lại được bằng anon key.
- [x] Chạy SQL tạo bảng `products` (schema đầy đủ ở mục 8.3):
```sql
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
```
- [x] Chạy SQL tạo bảng `posts` (schema đầy đủ ở mục 8.4):
```sql
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
```
- [x] Chạy SQL tạo bảng `orders` (schema đầy đủ ở mục 8.5, đã gồm `bottlesReturned`):
```sql
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
```
- [x] Bật **Row Level Security (RLS)** trên cả 3 bảng, phân quyền như sau:

| Bảng | Đọc (select) | Ghi (insert/update/delete) |
|---|---|---|
| `products` | Công khai (ai cũng xem được, để hiển thị trang `/san-pham`) | Chỉ chủ tiệm đã đăng nhập (qua `/admin/san-pham`) |
| `posts` | Công khai (để hiển thị `/blog`) | Chỉ chủ tiệm đã đăng nhập (qua `/admin/blog`) |
| `orders` | Công khai nhưng **lọc theo đúng SĐT** ở phía client (tra cứu đơn, mục 6.3) — đánh đổi bảo mật nhẹ chấp nhận được cho Phase 1, siết chặt hơn ở Phase 3 nếu cần | **Insert**: công khai (khách đặt hàng không cần đăng nhập). **Update/Delete**: chỉ chủ tiệm đã đăng nhập (qua `/admin/don-hang`, để cập nhật `status`) |

- [x] Tạo **1 tài khoản Supabase Auth duy nhất cho chủ tiệm** (`buitheu698@gmail.com`) dùng chung cho cả 3 trang quản trị `/admin/don-hang`, `/admin/san-pham`, `/admin/blog` (mục 6.2.2) — đã test đăng nhập thành công
- [x] Tạo **Storage bucket** `product-images` và `post-images` trong Supabase Storage
- [x] Nhập **dữ liệu khởi tạo (demo/placeholder)** vào bảng `products` (15 sản phẩm: 8 đồ uống lẻ + 2 combo + 5 Set Detox) và `posts` (5 bài nháp mục 6.5.1) qua `supabase/seed.mjs`

### 11.2 Bước 2 — Component dùng chung (`src/components/`, `src/layouts/`) ✅ XONG (11/09/2026)

⚠️ **Điều chỉnh kiến trúc phát hiện lúc code**: các thẻ `ProductCard`/`ComboCard`/`SetDetoxCard`/`BlogCard` viết dạng component `.astro` **chỉ render được lúc build/server**, không gọi được từ JS phía trình duyệt. Vì kiến trúc yêu cầu fetch dữ liệu Supabase ở client (để admin sửa không cần rebuild), đã bổ sung `src/lib/templates.ts` chứa hàm JS thuần (`productCardHtml`, `comboCardHtml`, `setDetoxCardHtml`, `blogCardHtml`) tạo đúng HTML tương ứng để dùng lúc fetch động. Các file `.astro` giữ lại làm tài liệu tham chiếu UI, style chuyển sang `<style is:global>` để class CSS dùng chung được cho cả HTML dựng từ `templates.ts`.

| File | Việc cụ thể |
|---|---|
| `layouts/BaseLayout.astro` | `<head>` với meta tag, `<title>` động theo prop, font links, import `global.css`, `<slot />` cho nội dung trang, include `<ZaloButton />` cố định |
| `components/Header.astro` | Logo (link `/images/brand/logo.jpg`) + tagline "SỐNG XANH - SỐNG KHỎE" + nav 5 mục + menu mobile dạng hamburger (breakpoint <768px) |
| `components/Footer.astro` | Chính sách (3 link: đổi trả chai, giao hàng, thanh toán) + icon thanh toán (chuyển khoản/momo/zalopay dạng SVG tĩnh) + social icon + copyright |
| `components/ZaloButton.astro` | 2 nút nổi góc phải dưới màn hình: Zalo (link `https://zalo.me/...`) + Messenger (link `https://m.me/gungdetox`), z-index cao, ẩn khi scroll xuống footer (tuỳ chọn) |
| `components/ProductCard.astro` | Props: `{ name, description, origin, volume, priceRetail, badge, image, video }` — theo schema mục 8.3, badge hiển thị theo enum `best-seller/new/sale/out-of-stock` |
| `components/ComboCard.astro` | Props theo schema mục 8.3 (`type='combo'`): `{ name, price, servings, deliverySchedule, bottleOptions, note }`, có radio chọn loại chai |
| `components/SetDetoxCard.astro` **(component mới, bổ sung vào mục 8.2)** | Props: `{ setNumber, name, goal, price, badge, colorTheme }` — 1 card cho mỗi trong 5 SET DETOX TỰ NHIÊN (mục 6.2.1), `colorTheme` để tô màu badge theo đúng tông ảnh gốc (xanh/vàng/đỏ/cam/mix) |
| `components/BlogCard.astro` | Props theo schema mục 8.4 (bảng `posts`) |
| `components/OrderLookup.astro` | Input SĐT (validate 10 số, đầu số VN hợp lệ) → gọi Supabase `select * from orders where phone = ? order by created_at desc limit 1` để lấy đơn gần nhất, và `select sum(bottles_returned) from orders where phone = ?` để cộng dồn số chai đã trả |
| `components/AdminLogin.astro` | Form đăng nhập Supabase Auth (email/password) dùng chung cho cả 3 trang admin — redirect về trang gọi nếu đã đăng nhập, chặn truy cập nếu chưa |
| `pages/admin/san-pham.astro` | Sau khi qua `AdminLogin`: danh sách sản phẩm hiện có (bảng, có nút Sửa/Xoá) + form thêm mới (đủ field theo schema mục 8.3) + upload ảnh lên bucket `product-images` |
| `pages/admin/blog.astro` | Tương tự: danh sách bài viết + form thêm/sửa bài (tiêu đề, nội dung, ảnh, tag) + upload ảnh lên bucket `post-images` |
| `pages/admin/don-hang.astro` | Danh sách đơn hàng (lọc theo trạng thái) + đổi `status` từng đơn (dropdown), tự động ghi thêm vào `status_history` |

### 11.3 Bước 3 — Trang chủ `/` (`src/pages/index.astro`) ✅ XONG (11/09/2026)
Đã kiểm chứng bằng Playwright: 0 lỗi console, 3 sản phẩm nổi bật fetch đúng từ Supabase theo đúng thứ tự đã chọn.
- [x] Viết nội dung thật cho "Vì sao chọn GỪNG" (3-4 điểm, dựa nội dung thật mục 1/9)
- [x] Chọn 3 sản phẩm nổi bật cho section 5: Ginger Shot, Set 2 — Ginger Thơm Tái Tạo, Kombucha (fetch động theo slug, không hard-code nội dung)
- [x] Trích 1 câu quote thương hiệu từ bài đăng thật (mục 9), giữ giọng "chị em" — không gắn tên khách hàng cụ thể
- [x] Nhúng ảnh bìa `anh bìa.jpg` vào section 6 (5 Set Detox) làm ảnh minh hoạ chính

### 11.4 Bước 4 — Trang Sản phẩm `/san-pham` (`src/pages/san-pham.astro`) ✅ XONG (11/09/2026)
Đã kiểm chứng bằng Playwright (script `.verify/check-page.mjs`): build production chạy `npm run preview`, mở `/san-pham`, chụp ảnh, **0 lỗi console**. Toàn bộ 8 sản phẩm lẻ, 5 Set Detox, 2 combo hiển thị đúng dữ liệu thật từ Supabase, bộ lọc danh mục hoạt động (client-side, không gọi lại Supabase mỗi lần đổi tab).
- [x] Gọi Supabase `select * from products order by sort_order` lúc trang tải (client-side JS, giống cơ chế `OrderLookup`) — **không hard-code sản phẩm vào file** — để chủ tiệm sửa/thêm qua `/admin/san-pham` là thấy thay đổi ngay, không cần build lại
- [x] Nhóm kết quả trả về theo `type` (`single`/`combo`/`set`) và `category` để render đúng lưới tương ứng bên dưới
- [x] Tab lọc danh mục (client-side filter trên dữ liệu đã fetch, không gọi lại Supabase mỗi lần đổi tab): Tất cả · Ginger Shot · Bia Gừng · Kombucha · 5 Set Detox · Combo thuê bao
- [x] Lưới sản phẩm lẻ: dùng `productCardHtml` cho từng sản phẩm `type='single'` — dữ liệu khởi tạo lấy từ bảng mục 6.2 (Ginger Shot, Bia Gừng, Juice, Smoothies, Sữa hạt, Kombucha, Củ Dền ngâm, Matcha)
- [x] Lưới **5 SET DETOX TỰ NHIÊN**: dùng `setDetoxCardHtml`, 5 card theo đúng bảng mục 6.2.1
- [x] Lưới combo thuê bao: `comboCardHtml` cho Combo tháng + Combo 3 tháng
- [x] Section so sánh chai thủy tinh/nhựa + box chương trình đổi/hoàn chai cũ — đã lên giao diện, **số tiền/điểm cụ thể vẫn là placeholder**, chờ chủ tiệm cung cấp
- [x] FAQ accordion (dùng `<details>/<summary>` HTML thuần)
- [x] Dòng CTA "Đặt cho văn phòng"

### 11.5 Bước 5 — Trang Đặt hàng `/dat-hang` (`src/pages/dat-hang.astro`) ✅ XONG (11/09/2026)
Đã kiểm chứng toàn bộ luồng bằng Playwright thao tác thật (không chỉ build): mở với `?product=combo-thang-ginger-shot` → sản phẩm được chọn sẵn đúng → đi qua đủ 4 bước → tóm tắt tính giá đúng (550.000đ) → bấm Đặt hàng → **đơn thật được tạo trong Supabase** → trang cảm ơn hiện đúng mã đơn → **tra cứu lại bằng đúng SĐT vừa đặt ở `OrderLookup` cuối trang cũng ra đúng kết quả**. 0 lỗi console trong toàn bộ luồng. Dữ liệu test đã được dọn sạch sau khi xác nhận.
- [x] **Bước 1 — Sản phẩm**: đọc query string (`?product=slug`) truyền từ nút "Đặt món này"/"Chọn combo này" ở trang Sản phẩm, hiển thị lại lựa chọn (dropdown fetch từ Supabase), cho sửa số lượng
- [x] **Bước 2 — Tuỳ chọn**: radio chai thủy tinh/nhựa (render động theo `bottle_options` của sản phẩm), chọn ngày giao ưu tiên (nếu là combo/set)
- [x] **Bước 3 — Thông tin giao hàng**: tên, SĐT, địa chỉ, dropdown Quận (Q.1/Q.3/Bình Thạnh/Khác — chọn "Khác" hiện cảnh báo thay vì chặn), ô "Số chai cũ muốn trả"
- [x] **Bước 4 — Xác nhận**: tóm tắt đơn tính giá đúng, ghi chú phí ship theo khoảng cách (Cách B), hiển thị thông tin chuyển khoản demo (⚠️ rõ ràng), nút "Đặt hàng" → insert vào bảng `orders` qua Supabase client
- [x] Trang cảm ơn hiện inline sau submit: hiện mã đơn (8 ký tự đầu) + `OrderLookup` ngay bên dưới
- [x] Gắn `OrderLookup` vào cuối trang `/dat-hang`

### 11.6 Bước 6 — Trang Quy trình `/quy-trinh`, Liên hệ `/lien-he` ✅ XONG (11/09/2026)
Đã kiểm chứng bằng Playwright, 0 lỗi console. Ảnh/video thật từ kho export (mục 9.3) **chưa** được nhúng vào Quy trình — hiện dùng nội dung chữ dựa trên sự thật đã biết (mục 1, 6.4); có thể bổ sung ảnh cụ thể sau khi chọn được ảnh phù hợp từ kho 703 ảnh.
- [x] Quy trình: viết nội dung theo 5 section mục 6.4
- [x] Liên hệ: nhúng Google Maps cho **cả 2 địa điểm** (2 iframe riêng), hiển thị giờ hoạt động dạng bảng
- [x] Thêm Schema.org `LocalBusiness` JSON-LD cho **cả 2 địa điểm** (1 block JSON-LD riêng mỗi địa điểm)

### 11.6.1 ⚠️ Lỗi quan trọng phát hiện & đã sửa lúc code: thuộc tính `[hidden]` bị vô hiệu hoá

Phát hiện qua Playwright: bất kỳ phần tử nào có CSS tự đặt `display` (vd. `.step { display: flex }` ở `dat-hang.astro`, `.admin-login-form { display: flex }` ở `AdminLogin.astro`) sẽ **âm thầm vô hiệu hoá** thuộc tính `hidden` mặc định của trình duyệt — vì CSS do tác giả viết luôn thắng CSS mặc định (UA stylesheet) của trình duyệt, bất kể độ ưu tiên (specificity). Hệ quả: phần tử "ẩn" vẫn hiển thị/chiếm chỗ.

**Đã sửa**: thêm 1 rule trong `global.css`:
```css
[hidden] {
  display: none !important;
}
```
Đảm bảo `hidden` luôn thắng ở mọi component, không cần nhớ tránh đặt `display` trong CSS từng nơi. Đã build lại và test lại toàn bộ luồng đặt hàng + admin sau khi sửa, xác nhận hoạt động đúng.

### 11.7 Bước 7 — SEO, kiểm thử, deploy (gộp từ mục 8.7, 8.8 thành checklist thao tác)
- [x] Viết title/description riêng cho 5 trang đã build (Trang chủ, Sản phẩm, Đặt hàng, Quy trình, Liên hệ) — Blog để Phase 2
- [ ] Nén ảnh sang WebP — **chưa cần** vì chưa có ảnh sản phẩm/blog thật nào được admin tải lên; áp dụng khi admin bắt đầu upload ảnh qua `/admin/san-pham`, `/admin/blog`
- [x] Tạo `sitemap.xml` (`@astrojs/sitemap`, đã set `site` trong `astro.config.mjs`, loại trừ `/admin/*`) + `robots.txt` (chặn crawl `/admin/`)
- [x] Test responsive trên mobile — dùng Playwright giả lập iPhone 13 (chưa test trên điện thoại thật). **Phát hiện 1 lỗi thật qua test này**: nút Zalo/Messenger nổi che nội dung trên màn hình hẹp — đã sửa (mục 11.7.1)
- [x] Test toàn bộ luồng đặt hàng thật: điền form → xác nhận dữ liệu đúng trong Supabase (qua script, tương đương table editor) → tra cứu lại bằng đúng SĐT vừa nhập — khớp
- [x] `npm run build` → `npm run preview` chạy đúng cục bộ, lặp lại nhiều lần trong suốt quá trình build
- [ ] Upload `dist/` lên Web Hosting iNET qua File Manager/FTP — **CHƯA LÀM, cố ý chờ xác nhận** (mục 11.7.2 — vì thông tin chuyển khoản trên site vẫn là demo, không nên đưa lên public trước khi có thông tin thật)
- [ ] Kiểm tra SSL sau khi deploy thật
- [ ] Làm thủ tục thông báo website với Bộ Công Thương tại thongbao.online.gov.vn (mục 7) — việc này chủ tiệm tự làm, không phải code

#### 11.7.1 Lỗi phát hiện qua test mobile: nút nổi che nội dung

`ZaloButton.astro` dùng nút dạng pill full chữ ("Zalo"/"Messenger"), trên màn hình <480px che mất phần cuối dòng chữ của card sản phẩm khi cuộn tới. Đã sửa: dưới 480px, nút thu gọn thành hình tròn 44px chỉ hiện chữ cái đầu (Z/M), giảm đáng kể diện tích che khuất. Vẫn còn chạm nhẹ mép chữ ở 1 số vị trí cuộn — chấp nhận được vì đây là hành vi phổ biến của widget chat nổi trên hầu hết website thật (không phải lỗi chặn thao tác, chỉ che 1 phần chữ).

#### 11.7.2 ⚠️ Chưa deploy lên production — quyết định có chủ đích

Toàn bộ 8 trang (chủ, sản phẩm, đặt hàng, quy trình, liên hệ, 3 trang admin) đã code xong và kiểm chứng kỹ bằng Playwright (0 lỗi console ở mọi trang, luồng đặt hàng + quản trị đều test thao tác thật). Tuy nhiên **chưa upload lên hosting iNET** vì:
- Thông tin chuyển khoản trên trang Xác nhận đặt hàng vẫn là **demo** (mục 6.3.1) — đưa lên site công khai lúc này có rủi ro khách hiểu nhầm là thông tin thật
- Nên chờ chủ tiệm xác nhận đã sẵn sàng lên chính thức trước khi deploy, vì đây là hành động khó đảo ngược hoàn toàn (dù có thể gỡ xuống, nhưng có thể đã bị Google index hoặc khách đã thấy)

Khi đã sẵn sàng: làm theo quy trình deploy ở mục 8.8 (build → upload `dist/` qua FTP/File Manager → cấu hình SSL).

### 11.8 Việc CHƯA đưa vào task breakdown này (cố ý, chờ thông tin thật từ chủ tiệm)
- **Thông tin chuyển khoản thật** (mục 6.3.1) — đang demo, cần thay trước khi web lên chính thức (không chặn việc build)
- **Số tiền/điểm cụ thể cho chương trình đổi chai cũ** (mục 6.2, 11.4) — đang để placeholder, chủ tiệm cung cấp sau
- **Giá lẻ đầy đủ từng vị Kombucha/Matcha** — không cần dev tra cứu nữa, chủ tiệm tự nhập qua `/admin/san-pham` sau khi web lên (mục 6.2.2)
