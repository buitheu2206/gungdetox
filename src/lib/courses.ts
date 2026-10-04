// Dữ liệu các gói chuyển giao/nhượng quyền hiển thị ở /khoa-hoc và
// /khoa-hoc/[slug] — tách riêng (không để trong khoa-hoc.astro) để cả trang
// danh sách và trang chi tiết cùng dùng chung 1 nguồn, tránh lặp dữ liệu.
// Nội dung lấy từ file "05 GÓI CHUYỂN GIAO. GUNGDETOX.md" chủ tiệm cung cấp.
export interface CoursePackage {
  slug: string;
  key: string;
  name: string;
  tagline: string;
  price: string;
  icon: string;
  image: string;
  recommended: boolean;
  highlights: string[];
  suitableFor: string[];
  note: string;
}

export const packages: CoursePackage[] = [
  {
    slug: "khoi-dong-online",
    key: "online",
    name: "Khởi động Online",
    tagline: "Tự học – Hỗ trợ kênh bán hàng",
    price: "15.000.000đ / dòng sản phẩm",
    icon: "💻",
    image: "/images/nhuong-quyen/package-online.webp",
    recommended: false,
    highlights: [
      "Trọn gói chuyển giao Online 5tr: công thức, định lượng, tài liệu, giải đáp",
      "Thiết lập hệ thống bán hàng Online: Gmail, Google Map, Fanpage Facebook (1000 follow, 30 bài), Instagram (30 bài), Threads (30 bài)",
      "Google Sheet quản lý đơn hàng – khách hàng – bán hàng",
      "Hỗ trợ chạy quảng cáo 10 ngày (chưa gồm ngân sách ads)",
    ],
    suitableFor: [
      "Chuẩn bị kinh doanh Online, chưa có hệ thống bán hàng",
      "Muốn làm bài bản ngay từ đầu, dễ bàn giao cho nhân viên sau này",
    ],
    note: "Thời gian hoàn thiện tối đa 25 ngày. Thanh toán trước khi nhận file.",
  },
  {
    slug: "hoc-thuc-te",
    key: "essential",
    name: "Gói 1 — Học thực tế",
    tagline: "Chuyển giao công thức",
    price: "29.000.000đ",
    icon: "🌱",
    image: "/images/nhuong-quyen/package-essential.webp",
    recommended: false,
    highlights: [
      "Trọn gói chuyển giao Online 5tr (công thức, 10 Sheet quản lý, tặng 8 công thức Matcha)",
      "03 ngày học thực tế tại tiệm TP.HCM: Ngày 1 làm quen & chuẩn hóa, Ngày 2 thực hành sản phẩm, Ngày 3 vận hành & bán hàng",
      "Hỗ trợ ăn 3 bữa trưa trong 3 ngày học",
      "Hỗ trợ giải đáp Online 01 tháng sau khóa học",
    ],
    suitableFor: [
      "Muốn học thực tế, cầm tay chỉ việc — chưa tự tin chỉ học qua file",
      "Có kế hoạch mở tiệm, có thể sắp xếp đến TP.HCM học 3 ngày",
    ],
    note: "Thời gian hoàn thiện tối đa 7 ngày. Thanh toán 2 đợt: 10tr chốt gói + 19tr trước khi học.",
  },
  {
    slug: "hoc-marketing",
    key: "professional",
    name: "Gói 2 — Học + Marketing",
    tagline: "Xây dựng thương hiệu",
    price: "39.000.000đ",
    icon: "🚀",
    image: "/images/nhuong-quyen/package-professional.webp",
    recommended: true,
    highlights: [
      "Giai đoạn 1: 15 ngày khởi động Online (tài khoản, Fanpage, Sheet quản lý...)",
      "Giai đoạn 2: 03 ngày học thực tế tại GỪNG (trọn nội dung Gói 1 — 29tr)",
      "Có nền tảng Online sẵn trước khi bắt đầu học trực tiếp",
      "Hỗ trợ Online sau khóa học theo nội dung chuyển giao",
    ],
    suitableFor: [
      "Muốn có cả nền tảng Online lẫn học thực tế, không chỉ 1 trong 2",
      "Kinh doanh tại Sài Gòn hoặc khu vực miền Nam",
    ],
    note: "Thời gian hoàn thiện 1 tháng. Thanh toán 2 đợt: 10tr chốt gói + 29tr trước khi học.",
  },
  {
    slug: "full-dong-hanh",
    key: "premium",
    name: "Gói 3 — Full đồng hành",
    tagline: "Đồng hành khởi nghiệp",
    price: "50.000.000đ",
    icon: "👑",
    image: "/images/nhuong-quyen/package-premium.webp",
    recommended: false,
    highlights: [
      "Trọn gói Khởi động toàn diện 39tr (15 ngày Online + 3 ngày học thực tế)",
      "Thêm 01 tháng đồng hành chạy Ads sau khóa học",
      "Theo dõi đơn hàng, điều chỉnh nội dung/quảng cáo cùng GỪNG trong giai đoạn đầu triển khai",
      "Ngân sách quảng cáo thực tế do khách hàng tự chi trả",
    ],
    suitableFor: ["Muốn được đồng hành theo từng giai đoạn, không tự xoay sở một mình trong tháng đầu"],
    note: "Thời gian hoàn thiện 2 tháng. Thanh toán 2 đợt: 10tr chốt gói + 40tr trước khi học.",
  },
];
