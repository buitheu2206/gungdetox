// Dữ liệu các gói chuyển giao/nhượng quyền hiển thị ở /khoa-hoc và
// /khoa-hoc/[slug] — tách riêng (không để trong khoa-hoc.astro) để cả trang
// danh sách và trang chi tiết cùng dùng chung 1 nguồn, tránh lặp dữ liệu.
// Đối chiếu với tài liệu "05 GÓI CHUYỂN GIAO. GUNGDETOX.docx" của chủ tiệm.
interface CourseSection {
  title: string;
  description: string;
  items: string[];
}

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
  introduction: string;
  sections: CourseSection[];
  completionTime: string;
  paymentTerms: string[];
  conditions: string[];
}

const formulaSections: CourseSection[] = [
  {
    title: "Công thức chi tiết và 8 công thức Matcha tặng kèm",
    description: "GỪNG bàn giao công thức và cách làm đã được chuẩn hóa trong quá trình vận hành, giúp bạn có cơ sở để tự thực hành và triển khai dòng sản phẩm.",
    items: [
      "Công thức ghi rõ nguyên liệu, định lượng, cách sơ chế, các bước thực hiện và thành phẩm.",
      "Hướng dẫn quy trình sơ chế, pha chế, bảo quản và các công cụ, dụng cụ cần chuẩn bị.",
      "Hướng dẫn tính giá vốn, giá bán và quy trình tư vấn khách hàng.",
      "Tặng 08 công thức Matcha để bạn có thêm lựa chọn phát triển menu.",
    ],
  },
  {
    title: "Bộ tài liệu Google gồm 10 sheet",
    description: "Các tài liệu và biểu mẫu được sắp xếp thành một hệ thống để bạn xem lại, áp dụng và quản lý công việc bán hàng, thay vì tự xây dựng từng file rời rạc.",
    items: [
      "Công thức pha chế.",
      "Sơ chế và bảo quản nguyên liệu.",
      "Quy trình tư vấn khách hàng.",
      "Cách tính giá vốn và giá bán.",
      "Công cụ và dụng cụ cần chuẩn bị.",
      "Quản lý nguyên liệu.",
      "Quản lý đơn hàng.",
      "Quản lý khách hàng.",
      "Theo dõi bán hàng.",
      "Quản lý hệ thống online.",
    ],
  },
  {
    title: "Hỗ trợ giải đáp online trong 01 tháng",
    description: "Khi bắt tay vào thực hành, bạn có thể trao đổi những phần chưa rõ với GỪNG trong phạm vi nội dung đã chuyển giao.",
    items: [
      "Giải đáp về công thức, nguyên liệu và quy trình thực hiện.",
      "Hỗ trợ sử dụng file quản lý và cách triển khai nội dung chuyển giao.",
      "Tài liệu được bàn giao để bạn tiếp tục xem lại, thực hành và điều chỉnh sau khi học.",
    ],
  },
];

const onlineSetup: CourseSection = {
  title: "15 ngày thiết lập hệ thống bán hàng online",
  description: "Các nền tảng được xây dựng với thông tin thống nhất, giúp khách nhận diện thương hiệu và giúp bạn quản lý, tiếp tục vận hành hoặc bàn giao cho nhân viên sau này.",
  items: [
    "Thiết lập Gmail và Google Maps.",
    "Thiết lập Fanpage Facebook với 1.000 người theo dõi và hệ thống 30 bài viết.",
    "Thiết lập Instagram với 30 bài viết.",
    "Thiết lập Threads với 30 bài viết.",
    "Sắp xếp hệ thống tài khoản và Google Sheet quản lý đơn hàng, khách hàng, nguyên liệu, bán hàng và dữ liệu online.",
    "Tổ chức dữ liệu từ lúc khách quan tâm, đặt hàng, xử lý đơn đến lưu thông tin và chăm sóc lại.",
  ],
};

const practicalSections: CourseSection[] = [
  {
    title: "Ngày 1 — Làm quen và chuẩn hóa",
    description: "Học và thực hành trực tiếp tại tiệm GỪNG ở TP.HCM, bắt đầu từ những bước chuẩn bị cơ bản.",
    items: [
      "Làm quen với nguyên liệu và cách sơ chế, bảo quản.",
      "Chuẩn bị công cụ, dụng cụ.",
      "Nắm công thức và định lượng.",
      "Thực hành các bước cơ bản, trao đổi ngay khi có phần chưa rõ.",
    ],
  },
  {
    title: "Ngày 2 — Thực hành sản phẩm",
    description: "Bạn trực tiếp làm sản phẩm, kiểm soát định lượng và hoàn thiện thành phẩm, thay vì chỉ quan sát.",
    items: [
      "Thực hành công thức, cân đo và kiểm soát thành phẩm.",
      "Chuẩn bị sản phẩm khi bán.",
      "Đóng gói và bảo quản.",
      "Nhận biết, xử lý các lỗi thường gặp khi thực hành.",
    ],
  },
  {
    title: "Ngày 3 — Vận hành và bán hàng",
    description: "Kết nối phần pha chế với công việc bán hàng để bạn hiểu cách chuẩn bị và vận hành một ngày tại tiệm.",
    items: [
      "Chuẩn bị một ngày bán hàng, tiếp nhận và xử lý đơn.",
      "Tư vấn khách hàng.",
      "Quản lý nguyên liệu và đơn hàng.",
      "Sử dụng các file quản lý.",
      "Trao đổi tình huống thực tế và giải đáp những vướng mắc sau hai ngày thực hành.",
    ],
  },
];

export const packages: CoursePackage[] = [
  {
    slug: "cong-thuc",
    key: "formula",
    name: "Gói 1 — Công thức",
    tagline: "Tự học – tự làm – tự triển khai",
    price: "5.000.000đ / dòng",
    icon: "📄",
    image: "/images/nhuong-quyen/package-formula.webp",
    recommended: false,
    introduction: "Gói chuyển giao online dành cho người muốn tự học, tự làm và triển khai dòng Ginger Shot. Bạn nhận công thức, quy trình và bộ công cụ quản lý đã được GỪNG hệ thống hóa, kèm 01 tháng giải đáp khi thực hành.",
    highlights: [
      "Công thức chi tiết, định lượng, sơ chế, cách thực hiện và thành phẩm",
      "Bộ tài liệu Google gồm 10 sheet hướng dẫn và quản lý",
      "Tặng 08 công thức Matcha",
      "Hỗ trợ giải đáp online 01 tháng trong phạm vi chuyển giao",
    ],
    suitableFor: [
      "Người đã có nền tảng pha chế cơ bản hoặc từng làm Juice, Smoothies, đồ uống healthy.",
      "Muốn tự học, tự thực hành và tự triển khai.",
      "Không thuận tiện đến học trực tiếp, đặc biệt khách ở miền Bắc hoặc miền Trung.",
    ],
    sections: formulaSections,
    completionTime: "2 ngày.",
    paymentTerms: ["Thanh toán trước khi nhận file chuyển giao."],
    conditions: ["Nếu chưa có nền tảng pha chế, GỪNG khuyến khích bạn chọn gói học trực tiếp để được hướng dẫn và thực hành cùng ngay từ đầu."],
  },
  {
    slug: "khoi-dong-online",
    key: "online",
    name: "Gói 2 — Khởi động Online",
    tagline: "Tự học – Hỗ trợ kênh bán hàng",
    price: "15.000.000đ / dòng sản phẩm",
    icon: "💻",
    image: "/images/nhuong-quyen/package-online.webp",
    recommended: false,
    introduction: "Gói Khởi động Online kết hợp phần chuyển giao sản phẩm 5 triệu đồng và phần thiết lập hệ thống bán hàng online 10 triệu đồng, tổng cộng 15 triệu đồng. Bạn có bộ khung từ sản phẩm đến tài khoản, quản lý và cách triển khai bán hàng.",
    highlights: [
      "Trọn nội dung gói Công thức: công thức, 10 sheet quản lý, 08 công thức Matcha và giải đáp online 01 tháng",
      "Thiết lập hệ thống bán hàng Online: Gmail, Google Map, Fanpage Facebook (1000 follow, 30 bài), Instagram (30 bài), Threads (30 bài)",
      "Google Sheet quản lý đơn hàng – khách hàng – bán hàng",
      "Hỗ trợ chạy quảng cáo 10 ngày (chưa gồm ngân sách ads)",
    ],
    suitableFor: [
      "Chuẩn bị kinh doanh online hoặc đã có sản phẩm nhưng chưa có hệ thống bán hàng.",
      "Chưa biết xây dựng tài khoản, lưu đơn hàng và quản lý khách hàng từ đâu.",
      "Muốn triển khai bài bản, dễ bàn giao hệ thống cho nhân viên sau này.",
      "Khách miền Bắc, miền Trung muốn triển khai online.",
    ],
    sections: [
      ...formulaSections,
      onlineSetup,
      {
        title: "10 ngày hỗ trợ chạy quảng cáo",
        description: "Sau phần xây dựng hệ thống online, GỪNG hỗ trợ chạy quảng cáo trong 10 ngày để bạn bắt đầu tiếp cận khách hàng.",
        items: ["Phí hỗ trợ triển khai đã nằm trong gói; ngân sách quảng cáo thực tế do khách hàng chi trả."],
      },
    ],
    completionTime: "Tối đa 25 ngày, gồm 15 ngày xây dựng hệ thống online và 10 ngày hỗ trợ chạy quảng cáo.",
    paymentTerms: ["Tổng gói 15.000.000đ: chuyển giao sản phẩm và quy trình 5.000.000đ + thiết lập hệ thống bán hàng online 10.000.000đ.", "Thanh toán trước khi nhận file chuyển giao."],
    conditions: ["Không bao gồm ngân sách quảng cáo, chi phí phần mềm hoặc tên miền bên thứ ba và các hạng mục phát sinh ngoài phạm vi đã thống nhất."],
  },
  {
    slug: "hoc-thuc-te",
    key: "essential",
    name: "Gói 3 — Học thực tế",
    tagline: "Chuyển giao công thức",
    price: "29.000.000đ",
    icon: "🌱",
    image: "/images/nhuong-quyen/package-essential.webp",
    recommended: false,
    introduction: "Gói học trực tiếp kết hợp toàn bộ tài liệu chuyển giao với 03 ngày thực hành tại tiệm GỪNG ở TP.HCM. Bạn được nhìn, hỏi, làm và điều chỉnh cùng người hướng dẫn, sau đó mang tài liệu về để tiếp tục ôn và triển khai.",
    highlights: [
      "Trọn gói chuyển giao Online 5tr (công thức, 10 Sheet quản lý, tặng 8 công thức Matcha)",
      "03 ngày học thực tế tại tiệm TP.HCM: Ngày 1 làm quen & chuẩn hóa, Ngày 2 thực hành sản phẩm, Ngày 3 vận hành & bán hàng",
      "Hỗ trợ ăn 3 bữa trưa trong 3 ngày học",
      "Hỗ trợ giải đáp Online 01 tháng sau khóa học",
    ],
    suitableFor: [
      "Muốn học thực tế, cầm tay chỉ việc — chưa tự tin chỉ học qua file",
      "Có kế hoạch mở tiệm, có thể sắp xếp đến TP.HCM học 3 ngày",
      "Muốn hiểu cả sản phẩm, quy trình và vận hành trước khi mở tiệm hoặc phát triển thêm dòng sản phẩm.",
    ],
    sections: [...formulaSections, ...practicalSections],
    completionTime: "Tối đa 7 ngày để hoàn thiện gói; thời lượng học trực tiếp tại tiệm là 03 ngày.",
    paymentTerms: ["Đợt 1: 10.000.000đ khi chốt gói.", "Đợt 2: 19.000.000đ trước khi học thực tế."],
    conditions: ["Học trực tiếp tại tiệm GỪNG ở TP.HCM, có hỗ trợ 03 bữa trưa trong 03 ngày học.", "Giá gói chưa bao gồm chi phí đi lại, lưu trú và ăn uống khác tại TP.HCM; học viên chủ động sắp xếp."],
  },
  {
    slug: "hoc-marketing",
    key: "professional",
    name: "Gói 4 — Học + Marketing",
    tagline: "Xây dựng thương hiệu",
    price: "39.000.000đ",
    icon: "🚀",
    image: "/images/nhuong-quyen/package-professional.webp",
    recommended: true,
    introduction: "Gói 39 triệu chuẩn bị nền tảng bán hàng online trong 15 ngày trước khi bạn đến GỪNG học thực tế 03 ngày. Bạn vừa có hệ thống tài khoản, dữ liệu quản lý, vừa có thời gian thực hành sản phẩm và vận hành tại tiệm.",
    highlights: [
      "Giai đoạn 1: 15 ngày khởi động Online (tài khoản, Fanpage, Sheet quản lý...)",
      "Giai đoạn 2: 03 ngày học thực tế tại GỪNG (trọn nội dung Gói 3 — 29tr)",
      "Có nền tảng Online sẵn trước khi bắt đầu học trực tiếp",
      "Hỗ trợ Online sau khóa học theo nội dung chuyển giao",
    ],
    suitableFor: [
      "Muốn có cả nền tảng Online lẫn học thực tế, không chỉ 1 trong 2",
      "Kinh doanh tại Sài Gòn hoặc khu vực miền Nam",
    ],
    sections: [
      onlineSetup,
      {
        title: "Chuẩn bị trước khi đến học",
        description: "Giai đoạn online được triển khai trước lịch học trực tiếp, giúp bạn có sẵn nền tảng để tiếp tục vận hành và bàn giao cho nhân sự sau này.",
        items: ["Chuẩn bị Google Chrome và hệ thống tài khoản thống nhất.", "GỪNG gửi file để bạn vừa học vừa theo dõi công thức và cách thực hiện."],
      },
      ...formulaSections,
      ...practicalSections,
    ],
    completionTime: "1 tháng; lộ trình gồm 15 ngày chuẩn bị online trước khi học trực tiếp và 03 ngày thực hành tại TP.HCM.",
    paymentTerms: ["Đợt 1: 10.000.000đ khi chốt gói.", "Đợt 2: 29.000.000đ trước khi học thực tế."],
    conditions: ["GỪNG hỗ trợ 03 bữa trưa trong 03 ngày học trực tiếp tại tiệm.", "Chi phí đi lại và lưu trú do học viên chủ động sắp xếp.", "Hỗ trợ online sau khóa học trong phạm vi nội dung chuyển giao."],
  },
  {
    slug: "full-dong-hanh",
    key: "premium",
    name: "Gói 5 — Full đồng hành",
    tagline: "Đồng hành khởi nghiệp",
    price: "50.000.000đ",
    icon: "👑",
    image: "/images/nhuong-quyen/package-premium.webp",
    recommended: false,
    introduction: "Gói Full đồng hành bao gồm phần chuẩn bị online và học thực tế của gói 39 triệu, cộng thêm 01 tháng hỗ trợ chạy quảng cáo sau khóa học. Khi bắt đầu bán hàng tại địa phương, bạn tiếp tục cùng GỪNG theo dõi, trao đổi và điều chỉnh quá trình triển khai.",
    highlights: [
      "Trọn gói Khởi động toàn diện 39tr (15 ngày Online + 3 ngày học thực tế)",
      "Thêm 01 tháng đồng hành chạy Ads sau khóa học",
      "Theo dõi đơn hàng, điều chỉnh nội dung/quảng cáo cùng GỪNG trong giai đoạn đầu triển khai",
      "Ngân sách quảng cáo thực tế do khách hàng tự chi trả",
    ],
    suitableFor: ["Muốn được đồng hành theo từng giai đoạn, không tự xoay sở một mình trong tháng đầu"],
    sections: [
      onlineSetup,
      ...formulaSections,
      ...practicalSections,
      {
        title: "01 tháng đồng hành triển khai và chạy quảng cáo",
        description: "Sau khi hoàn thành khóa học và bắt đầu bán hàng thực tế, GỪNG tiếp tục đồng hành trong 01 tháng. Đây là phần bổ sung so với gói 39 triệu.",
        items: [
          "Hỗ trợ thiết lập và triển khai quảng cáo.",
          "Hướng dẫn xây dựng nội dung phục vụ quảng cáo.",
          "Theo dõi quá trình chạy quảng cáo và hỗ trợ điều chỉnh.",
          "Theo dõi đơn hàng, dữ liệu và phản hồi từ khách hàng; hướng dẫn đi đơn.",
          "Trao đổi, hỗ trợ xử lý những vấn đề phát sinh trong giai đoạn đầu.",
        ],
      },
    ],
    completionTime: "2 tháng; gồm 15 ngày khởi động online, 03 ngày học trực tiếp và 01 tháng đồng hành chạy quảng cáo sau khóa học.",
    paymentTerms: ["Đợt 1: 10.000.000đ khi chốt gói.", "Đợt 2: 40.000.000đ trước khi học thực tế."],
    conditions: ["Ngân sách quảng cáo thực tế do khách hàng chủ động chi trả, chưa bao gồm trong giá gói.", "Gói bao gồm quyền lợi của gói 39 triệu: hỗ trợ 03 bữa trưa khi học; học viên tự sắp xếp chi phí đi lại và lưu trú.", "GỪNG hỗ trợ, hướng dẫn và cùng theo dõi quá trình triển khai; không làm thay việc vận hành kinh doanh của bạn."],
  },
];
