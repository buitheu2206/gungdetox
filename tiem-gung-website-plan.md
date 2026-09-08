# Plan xây dựng website Tiệm GỪNG

## 1. Thông tin doanh nghiệp (trích từ Facebook facebook.com/gungdetox)

- **Tên**: Tiệm GỪNG — đồ uống lên men/detox từ gừng tươi, giao tận nhà theo tuần tại TP.HCM
- **Địa chỉ**: 60M Nguyễn Thông, Quận 3, TP.HCM
- **Hotline/Zalo**: 0888 267 009
- **Email**: gingera.ltd@gmail.com
- **Instagram**: @gungdetox.saigon
- **Facebook**: facebook.com/gungdetox
- **Sản phẩm chính**:
  - Ginger Shot (gừng tươi + nghệ + chanh vàng + mật ong + muối hồng)
  - Bia Gừng - dễ tiêu
  - Kombucha đủ vị
  - Tất cả làm mới mỗi ngày theo quy trình riêng của tiệm
- **Mô hình bán hàng**: Combo thuê bao
  - Combo tháng (chai nhựa): 500K — 28 lần uống, giao 4 đợt/tuần, mỗi chai 220ml = 7 lần uống (30ml/lần)
  - Combo Ginger 3 tháng: 1.500K
- **Hệ thống chai refill**: chai thủy tinh (sang, chắc, dùng lâu dài) hoặc chai nhựa (gọn, nhẹ, dễ trữ đông/mang đi xa) — khách chọn theo nhu cầu
- **Kênh đặt hàng**: không có giỏ hàng online — khách đặt qua inbox Facebook/Zalo
- **Giọng điệu thương hiệu**: thân mật, gọi khách là "chị em", dùng emoji 💚🌿, nội dung xoay quanh sức khỏe/eat clean/detox
- **Đối tượng khách hàng**: phụ nữ quan tâm sức khỏe, lối sống lành mạnh

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
| Header (logo + tagline) | Logo "Tiệm GỪNG" + tagline "Detox tự nhiên · Sài Gòn" |
| Hero (H1 + CTA) | H1 "Tiệm GỪNG xin chào!" + CTA "Xem menu" / "Đặt combo" |
| Social follow | Facebook, Instagram |
| Journey carousel | Thay bằng "Vì sao chọn GỪNG" — quy trình làm mới mỗi ngày, nguyên liệu thật, minh bạch |
| Khám phá (4 mục) | Menu đồ uống / Combo thuê bao / Bí kíp detox (blog sức khỏe) / Chai refill (giải thích glass vs nhựa) |
| Quote cá nhân | Trích một câu từ bài post gần đây, giữ giọng "chị em" |
| Liên hệ | Địa chỉ (Google Maps) + Hotline/Zalo + Email |
| Footer chính sách | Chính sách đổi trả chai refill, giao hàng theo tuần, thanh toán |

**Khác biệt quan trọng so với bản gốc**: Tiệm GỪNG không bán qua giỏ hàng online — flow thực tế là xem menu/combo → CTA dẫn thẳng về Zalo/Messenger để đặt, thay vì form đặt hàng như `/dat-nuoc` của mexoaikechuyen.vn. Bù lại, Tiệm GỪNG nên có thêm **tra cứu đơn bằng SĐT** ngay từ Phase 1 (xem mục 3) vì chi phí thêm không lớn khi đã dùng Supabase.

## 5. Hướng thiết kế (đã nghiên cứu, chưa build)

- **Màu sắc**: tông nghệ/gừng ấm (vàng nghệ đậm) phối với xanh lá đậm kiểu chai thủy tinh kombucha, nền giấy ấm nhẹ — tránh công thức be + cam đất khuôn mẫu thường thấy.
- **Font chữ**: đã xác nhận 2 font hỗ trợ đầy đủ dấu tiếng Việt (subset vietnamese trên Google Fonts):
  - **Fraunces** (serif có cá tính) — dùng cho heading/display
  - **Be Vietnam Pro** (sans hiện đại, thiết kế riêng cho tiếng Việt) — dùng cho nội dung/body
- **Bố cục**: multi-page giống bản gốc, nhưng thay carousel hành trình cá nhân bằng phần "quy trình làm mới mỗi ngày" — vì sản phẩm sức khỏe cần yếu tố tin cậy/minh bạch nguyên liệu hơn là câu chuyện cá nhân thuần túy.

## 6. Kế hoạch chi tiết từng trang (wireframe theo section + heading)

Sitemap đề xuất: `/` (Trang chủ) · `/san-pham` (Sản phẩm) · `/dat-hang` (Đặt hàng + tra cứu đơn) · `/quy-trinh` (Giới thiệu) · `/blog` (Bí kíp sức khỏe) · `/lien-he` (Liên hệ) · `/thanh-vien` (Thành viên, Phase 2)

### 6.1 Trang chủ — `/`
| # | Section | Heading | Nội dung/thành phần |
|---|---|---|---|
| 1 | Header | — | Logo "Tiệm GỪNG" + tagline "Detox tự nhiên · Sài Gòn" + nav (Sản phẩm, Đặt hàng, Giới thiệu, Blog, Liên hệ) + link "Thành viên" |
| 2 | Hero | H1 | "Tiệm GỪNG xin chào!" + câu dẫn ngắn + CTA chính **"Xem sản phẩm"**, CTA phụ **"Đặt hàng ngay"** |
| 3 | Social follow | — | Icon Facebook, Instagram |
| 4 | Vì sao chọn GỪNG | H2 | 3-4 điểm: nguyên liệu thật (gừng tươi, nghệ, chanh vàng, mật ong, muối hồng), làm mới mỗi ngày, hệ chai refill sạch |
| 5 | Sản phẩm nổi bật | H2 | 3 card rút gọn: Ginger Shot / Bia Gừng / Kombucha, mỗi card có ảnh + giá từ + nút "Xem chi tiết" → sang `/san-pham` |
| 6 | Combo thuê bao | H2 | Tóm tắt 2 gói (Combo tháng 500K, Combo 3 tháng 1.500K) + nút "Xem gói" → sang `/san-pham#combo` |
| 7 | Quote khách hàng/thương hiệu | H3 | Trích 1 câu từ bài đăng thật, giữ giọng "chị em" |
| 8 | Liên hệ nhanh | H3 | Địa chỉ rút gọn + hotline + nút "Chat Zalo" |
| 9 | Footer | — | Chính sách đổi trả chai refill, giao hàng theo tuần, thanh toán; social links; copyright |
| — | Widget cố định | — | Nút chat nổi Zalo/Messenger góc màn hình, hiển thị trên **mọi trang** |

### 6.2 Trang Sản phẩm — `/san-pham` (trọng tâm)
**Mục tiêu**: khách hiểu rõ toàn bộ sản phẩm, giá, quy cách trước khi quyết định đặt — đóng vai trò "danh mục sản phẩm" trung tâm của site.

| # | Section | Heading | Nội dung/thành phần |
|---|---|---|---|
| 1 | Header/breadcrumb | H1 | "Sản phẩm" — mô tả ngắn 1 dòng |
| 2 | Bộ lọc danh mục | — | Tab/chip: Tất cả · Ginger Shot · Bia Gừng · Kombucha · Combo thuê bao |
| 3 | Lưới sản phẩm lẻ | H2 "Đồ uống lẻ" | Card sản phẩm (xem cấu trúc card bên dưới) |
| 4 | Lưới combo thuê bao | H2 "Combo thuê bao" (anchor `#combo`) | Card combo (cấu trúc riêng, xem bên dưới) |
| 5 | Giải thích hệ chai | H3 "Chọn loại chai phù hợp" | So sánh 2 cột: Chai thủy tinh vs Chai nhựa (ưu/nhược, cách bảo quản, hướng dẫn refill) |
| 6 | FAQ ngắn | H3 | 3-4 câu hỏi thường gặp (đổi vị, giao hàng trễ, refill bẩn...) |
| 7 | Footer | — | như trang chủ |

**Cấu trúc 1 card sản phẩm lẻ:**
- **Media**: ảnh sản phẩm *(thiếu — cần bổ sung)*, có thể thay/kèm bằng **video ngắn** (quy trình pha chế, cách dùng) — card hỗ trợ cả 2 loại, ảnh làm mặc định, video phát khi hover/tap
- Tên + mô tả ngắn (thành phần chính, công dụng)
- Dung tích/quy cách
- Giá lẻ *(thiếu — hiện chỉ có giá combo)*
- Nhãn nếu có: Best-seller / Mới / Tạm hết
- Nút **"Đặt món này"** → sang `/dat-hang` kèm sản phẩm đã chọn

**Ví dụ danh sách sản phẩm lẻ ban đầu** (placeholder, chờ ảnh/video thật):

| Sản phẩm | Media | Mô tả ngắn | Giá lẻ |
|---|---|---|---|
| Ginger Shot | Ảnh + video pha chế | Gừng tươi + nghệ + chanh vàng + mật ong + muối hồng | *(chờ giá)* |
| Bia Gừng - dễ tiêu | Ảnh | Lên men tự nhiên, hỗ trợ tiêu hóa | *(chờ giá)* |
| Kombucha vị 1 *(vd. Kombucha Dâu)* | Ảnh | *(chờ mô tả)* | *(chờ giá)* |
| Kombucha vị 2 *(vd. Kombucha Gừng Nghệ)* | Ảnh | *(chờ mô tả)* | *(chờ giá)* |
| Kombucha vị 3 *(vd. Kombucha Hoa Đậu Biếc)* | Ảnh | *(chờ mô tả)* | *(chờ giá)* |

*(Đây là khung mẫu để dễ hình dung lưới sản phẩm — cần thay bằng danh sách vị Kombucha thật và giá thật từ dữ liệu Facebook.)*

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
| 5 | **Tra cứu đơn bằng SĐT** | Ô nhập SĐT → hiển thị trạng thái đơn gần nhất (Đang xử lý / Đang giao / Đã giao) — chủ tiệm cập nhật trạng thái thủ công qua trang quản trị đơn giản (xem 8.1) |

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

**Đề xuất**: bắt đầu với **Phương án A + tra cứu đơn** cho bản đầu tiên — đây chính là mức "vừa đủ tốt" mà mexoaikechuyen.vn đang làm, nâng cấp lên Phương án B khi lượng khách tăng.

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

- Không cần khóa nội dung như bản gốc `/bi-kip` trừ khi Tiệm GỪNG có ý định bán khóa học riêng

### 6.6 Trang Liên hệ — `/lien-he`
| # | Section | Heading | Nội dung |
|---|---|---|---|
| 1 | Hero | H1 | "Liên hệ Tiệm GỪNG" |
| 2 | Thông tin liên hệ | H3 | Địa chỉ (60M Nguyễn Thông, Q.3) + Google Maps, Hotline/Zalo, Email, giờ hoạt động *(thiếu)* |
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
- [ ] **Chọn Phương án A hay B cho chức năng Đặt hàng** (mục 6.3) — quyết định quan trọng nhất, ảnh hưởng tới toàn bộ kiến trúc kỹ thuật
- [ ] Xác nhận có muốn tra cứu đơn bằng SĐT ngay từ Phase 1 không (mục 6.3)
- [ ] Xác nhận/bổ sung: giá bán lẻ từng loại đồ uống, giờ hoạt động cụ thể, ảnh sản phẩm thật, danh sách đầy đủ vị Kombucha
- [ ] Xác nhận giữ hay bỏ phần "Bí kíp" dạng bán khóa học
- [ ] Xác nhận có làm trang Thành viên/tích điểm (mục 6.7) hay để sau
- [ ] Xác nhận kênh đặt hàng chính (Zalo hay Facebook Messenger) để đặt CTA cho đúng
- [ ] Duyệt hướng màu sắc/font trước khi dựng bản demo
- [ ] Đối chiếu lại toàn bộ thông tin sau khi có file export từ Meta Business Suite
- [ ] Duyệt đề xuất công nghệ ở mục 8.1 (Astro/Next.js + Supabase) hoặc chỉ định công nghệ khác

## 8. Kế hoạch kỹ thuật chi tiết

### 8.1 Lựa chọn công nghệ (đề xuất, chờ duyệt — đã điều chỉnh sau khi phân tích mexoaikechuyen.vn)
- **Framework**: [Astro](https://astro.build) cho phần trang tĩnh (chủ, sản phẩm, blog, giới thiệu, liên hệ) kết hợp **Supabase** (Postgres + Auth + Storage, có gói miễn phí) cho phần cần dữ liệu động: tra cứu đơn bằng SĐT, (Phase 2) tài khoản Thành viên
  - Đây là kiến trúc gần giống với mexoaikechuyen.vn (vốn dùng Lovable + khả năng cao là Supabase phía sau), nhưng code tay bằng Astro thay vì dùng nền tảng AI builder, để chủ động kiểm soát mã nguồn và chi phí dài hạn
  - Nếu ưu tiên tốc độ code hơn kiểm soát, có thể cân nhắc Next.js thay Astro (tương đương về khả năng, quen thuộc hơn nếu sau này cần nhiều trang động)
- **Styling**: CSS thuần theo đúng design system đã chốt (font Fraunces + Be Vietnam Pro, palette nghệ/xanh) — không dùng thư viện UI có sẵn để giữ đúng bản sắc thương hiệu
- **Backend cho đặt hàng/tra cứu đơn**: 1 bảng `orders` trong Supabase, cập nhật trạng thái qua trang quản trị nội bộ đơn giản (route riêng, chỉ chủ tiệm đăng nhập được) — không cần xây hệ thống giỏ hàng phức tạp

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
│   │   │   └── don-hang.astro   → quản trị đơn hàng (nội bộ, cần đăng nhập)
│   │   └── blog/
│   │       ├── index.astro      → /blog
│   │       └── [slug].astro     → /blog/:slug
│   ├── content/
│   │   ├── products/            (1 file / sản phẩm, frontmatter + mô tả)
│   │   └── blog/                (1 file .md / bài viết)
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

### 8.3 Data schema — Sản phẩm lẻ
```json
{
  "slug": "ginger-shot",
  "name": "Ginger Shot",
  "category": "ginger-shot",
  "description": "Gừng tươi + nghệ + chanh vàng + mật ong + muối hồng",
  "volume": "30ml/lần",
  "priceRetail": null,
  "media": {
    "image": "/images/products/ginger-shot.jpg",
    "video": "/videos/products/ginger-shot-process.mp4"
  },
  "badge": "best-seller",
  "inStock": true
}
```

### 8.4 Data schema — Combo thuê bao
```json
{
  "slug": "combo-thang",
  "name": "Combo tháng",
  "durationDays": 30,
  "servings": 28,
  "price": 500000,
  "deliverySchedule": "4 đợt/tuần",
  "bottleOptions": ["glass", "plastic"],
  "note": "Giá chưa gồm phí ship"
}
```

### 8.5 Data schema — Bài blog
```json
{
  "slug": "6-cach-an-cu-den",
  "title": "6 cách ăn củ dền",
  "date": "2026-08-09",
  "readTime": "4 phút",
  "tag": "eat-clean",
  "media": {
    "image": "/images/blog/cu-den.jpg",
    "video": null
  }
}
```

### 8.6 Data schema — Đơn hàng (bảng Supabase `orders`)
```json
{
  "id": "uuid",
  "phone": "090xxxxxxx",
  "customerName": "Nguyễn Thị A",
  "items": [
    { "productSlug": "combo-thang", "bottleType": "glass", "quantity": 1 }
  ],
  "status": "processing",
  "statusHistory": [
    { "status": "processing", "at": "2026-08-17T10:00:00Z" }
  ],
  "createdAt": "2026-08-17T10:00:00Z"
}
```
`status` gồm: `processing` (đang xử lý) · `delivering` (đang giao) · `delivered` (đã giao) · `cancelled` (đã huỷ)

### 8.7 Các giai đoạn phát triển (đề xuất)

**Phase 1 — MVP + tra cứu đơn (2-3 tuần)**
- Trang chủ, Sản phẩm, Giới thiệu, Liên hệ với nội dung/ảnh thật
- Đặt hàng theo Phương án A (nút mở Zalo/Messenger kèm tin nhắn soạn sẵn)
- **Tra cứu đơn bằng SĐT** + trang quản trị đơn hàng nội bộ đơn giản (Supabase)
- Deploy lên Vercel/Netlify (miễn phí) + Supabase (free tier)

**Phase 2 — Blog + SEO + Thành viên (tuỳ chọn)**
- Trang Blog với 3-5 bài viết đầu (dùng content sẵn có từ Facebook)
- Thêm meta title/description, Open Graph image cho từng trang
- Đăng ký Google Search Console
- Nếu cần: trang Thành viên (đăng nhập, lịch sử đơn, tích điểm)

**Phase 3 — Nâng cấp đặt hàng (khi có nhu cầu)**
- Chuyển sang Phương án B: form đặt hàng nhiều bước tự phục vụ, gắn với tài khoản Thành viên
- Cân nhắc thêm thanh toán online (VNPay/Momo) nếu cần

### 8.8 SEO & hiệu năng — checklist
- [ ] Mỗi trang có title/description riêng, tiếng Việt có dấu chuẩn
- [ ] Ảnh nén, định dạng WebP; video có ảnh poster tĩnh trước khi phát
- [ ] `sitemap.xml` + `robots.txt`
- [ ] Schema.org LocalBusiness (địa chỉ, giờ mở cửa, số điện thoại) để hiện tốt trên Google Maps/Search
- [ ] Kiểm tra responsive trên mobile — khách chủ yếu thao tác/đặt hàng qua điện thoại

### 8.9 Hosting & triển khai — dùng dịch vụ iNET (portal.inet.vn)

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
