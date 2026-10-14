**Báo cáo clean code và code smell — GỪNG DETOX, 14/10/2026**

Repo cung cấp website bán hàng, checkout, quản lý đơn, sản phẩm, blog và email thông báo. Astro tạo website tĩnh; trình duyệt gọi Supabase trực tiếp. Đánh giá theo quy mô một cửa hàng, khoảng ba quản trị viên, danh mục nhỏ và đơn hàng tích lũy theo thời gian; chưa đo lưu lượng thực tế.

**Kết luận: clean code khoảng 5/10; nợ kỹ thuật ở mức trung bình–cao và tập trung ở checkout/admin. Phạm vi sửa tổng thể ở mức vừa.** Điểm số là nhận định kỹ thuật, không phải kết quả SonarQube hoặc chỉ số tiêu chuẩn. Kiến trúc Astro + Supabase vẫn phù hợp; có thể cải thiện từng luồng mà không cần viết lại hệ thống.

Bản đánh giá dựa trên commit 654c19c. Working tree sạch trước khi tạo báo cáo. Các phát hiện bảo mật được kiểm tra lại trong mã hiện tại; cấu hình production đã kiểm tra ngày 13/10 không được coi là đã kiểm tra lại ngày 14/10.

**Số liệu và cách hiểu**

| Chỉ số | Kết quả | Ý nghĩa |
| --- | ---: | --- |
| File trong src | 53 | Quy mô nhỏ, có thể sửa từng phần |
| Tổng dòng trong src | 12.044 | Bao gồm markup, CSS, comment và dòng trống |
| CSS, kể cả style trong Astro | 5.823 dòng, khoảng 48% | File dài không tự động đồng nghĩa logic phức tạp |
| Script trong Astro và file .ts | 3.457 dòng | Chưa tính logic trong frontmatter Astro |
| Checkout dat-hang.astro | 1.444 dòng; 455 dòng script | Điểm tập trung trạng thái và nghiệp vụ |
| Ba trang admin | 842 dòng script | Sản phẩm 293, blog 257, đơn hàng 292 |
| Gán innerHTML | 27 vị trí | Điểm cần rà đầu ra; không phải 27 lỗ hổng |
| Dùng any | 10 vị trí | Chủ yếu ở dữ liệu admin và Quill |
| Non-null assertion | Khoảng 108 vị trí | Đếm bằng mẫu văn bản; nhiều vị trí DOM tĩnh là hợp lý |
| Đoạn lặp giữa script admin sản phẩm/blog | Ít nhất 51 dòng giống hệt | So khớp các cụm từ 8 dòng, bỏ dòng trống và comment một dòng; chưa phải tỷ lệ trùng toàn repo |
| Component card không được import | 4 file, 179 dòng | Đang được giữ làm tham chiếu; không tham gia rendering |
| Script .verify | 117 file .mjs | Nhiều script kiểm tra thủ công, không tương đương 117 test tự động |
| Unit test | 45 test trong 8 file | Đã chạy, đều pass |

Không thể suy ra “bao nhiêu phần trăm code bị smell” từ các số trên. Báo cáo ghi nhận **14 nhóm vấn đề**: 7 cần sửa sớm, 6 nên sửa, 1 nhóm dọn nhẹ. Một nhóm có thể xuất hiện ở nhiều file; không đếm từng dòng giống nhau thành một lỗi riêng.

**Điểm đang làm tốt**

- Cấu trúc pages/components/lib rõ, tên hàm phần lớn thể hiện đúng nghiệp vụ. Dependency trực tiếp ít, không có nhiều lớp trừu tượng khó lần theo.
- Logic giá, mã đơn, thanh toán, trạng thái, ảnh chuyển khoản và xóa nội dung đã có helper riêng. Hai màn quản lý dùng chung saveOrderPayment và saveOrderStatus.
- Luồng xóa nội dung kiểm tra DB trước khi dọn ảnh; báo được lỗi một phần. Luồng receipt có giới hạn file, retry xác nhận và URL xem ảnh hết hạn.
- Test đã bao phủ giá thiếu/giá bằng 0, lỗi quyền ghi, receipt, webhook và thanh toán. Email có escape HTML và kiểm tra secret. Đây là nền để sửa từng phần an toàn.

**Cần sửa sớm**

1. **Thông tin đăng nhập admin được ghi cứng trong Git — mức khẩn cấp.**

   Script kiểm tra trình duyệt điền trực tiếp mật khẩu admin. Có 5 vị trí được Git theo dõi: .verify/check-admin-gallery.mjs:19, check-admin-gallery2.mjs:16, check-admin.mjs:23, check-delivery-date-note.mjs:42 và check-order-classification.mjs:65. Báo cáo không chứa giá trị mật khẩu, không thử đăng nhập để kiểm tra hiệu lực.

   Sửa nhỏ trong code: lấy credential test từ môi trường, dùng tài khoản/môi trường test. Nếu mật khẩu còn hiệu lực hoặc được dùng lại, phải đổi mật khẩu và xử lý phiên đăng nhập. Xóa chuỗi ở commit mới không xóa nó khỏi lịch sử Git. Bỏ qua sẽ tiếp tục để người có bản sao repo biết credential; xử lý lịch sử cần kế hoạch riêng.

2. **Quyền nghiệp vụ đặt sai ranh giới — mức cao.**

   [schema.sql:80](</Users/nghiabui/Webstorm Project/gungdetox/supabase/schema.sql:80>) cấp quyền sửa/xóa cho mọi authenticated; orders còn đọc và tạo công khai. [AdminLogin.astro:50](</Users/nghiabui/Webstorm Project/gungdetox/src/components/AdminLogin.astro:50>) chỉ xác nhận có user. Điều này khiến tên “Admin” của policy không khớp quyền thực tế.

   Sửa bằng policy kiểm tra admin ở DB, khóa INSERT trực tiếp và giữ API tạo đơn có validation. Thiết kế rõ quyền tra cứu trước khi khóa SELECT. Nếu bỏ qua, refactor giao diện vẫn không giải quyết việc truy cập dữ liệu sai quyền. Phạm vi trung bình: SQL, auth UI, checkout/lookup và test quyền; không cần đổi framework.

3. **Dựng HTML/CSV từ dữ liệu chưa xử lý an toàn — mức cao.**

   [Bảng đơn:178](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/don-hang.astro:178>) nội suy thông tin khách vào HTML; [templates.ts:91](</Users/nghiabui/Webstorm Project/gungdetox/src/lib/templates.ts:91>) trả nguyên rich HTML; [CSV:302](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/don-hang.astro:302>) chỉ escape dấu nháy. Dữ liệu chứa event handler hoặc tiền tố công thức có thể được diễn giải thành mã thay vì văn bản.

   Dùng textContent/DOM cho văn bản, sanitizer theo allowlist cho rich text và xử lý công thức CSV riêng. Bỏ qua có thể dẫn tới XSS và CSV injection. Phạm vi trung bình vì phải rà các caller của templates, không chỉ đổi một helper escape. Kết quả XSS trong iframe cách ly thuộc đợt kiểm tra ngày 13/10; lần này xác nhận pattern vẫn tồn tại trong source.

4. **Lịch sử trạng thái bị ghi đè khi hai admin dùng dữ liệu cũ — mức cao.**

   [order-status.ts:5](</Users/nghiabui/Webstorm Project/gungdetox/src/lib/order-status.ts:5>) nối lịch sử trên bản sao ở trình duyệt rồi ghi lại cả mảng. Hai người cùng mở đơn processing; A đổi sang delivering, B sau đó đổi sang cancelled. Lần ghi của B làm mất sự kiện của A. Đã tái hiện bằng fake client, không ghi production.

   Đưa cập nhật trạng thái và nối lịch sử vào một thao tác nguyên tử trong DB; hoặc dùng kiểm tra phiên bản và báo xung đột. Nếu bỏ qua, lịch sử không đáng tin khi nhiều admin thao tác. Phạm vi nhỏ–vừa: helper dùng chung, một RPC/migration và test cạnh tranh.

5. **Lỗi truy vấn bị biến thành dữ liệu rỗng — mức cao.**

   [Blog getStaticPaths:10](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/blog/[slug].astro:10>) và [sản phẩm:13](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/san-pham/[slug].astro:13>) bỏ qua error rồi dùng data ?? []. Khi Supabase lỗi, cả hai trả danh sách route rỗng. Đã kiểm chứng trực tiếp hàm trích từ source với fake transport. [Checkout:706](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/dat-hang.astro:706>) cũng không xử lý lỗi tải danh mục rõ ràng.

   Cho build thất bại khi không đọc được dữ liệu bắt buộc; giao diện phân biệt “không có sản phẩm” và “tải thất bại”. Bỏ qua sẽ tạo bản build thiếu route mà pipeline vẫn có thể tiếp tục deploy. Phạm vi nhỏ, khoảng ba file và test lỗi truy vấn.

6. **Upload ảnh và lưu nội dung không xử lý lỗi giữa chừng — mức vừa.**

   [Admin sản phẩm:330](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/san-pham.astro:330>) và [admin blog:261](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/blog.astro:261>) upload trước, đẩy URL vào state rồi mới ghi DB. Ví dụ ảnh A upload thành công, B lỗi; bấm lưu lại sẽ upload A lần nữa. DB lỗi sau upload cũng để lại file không được bản ghi tham chiếu. Hai handler chưa khóa nút lưu trong lúc chờ.

   Tách danh sách upload thành công của mỗi lượt, tránh upload lại khi retry, khóa submit đang chạy và xử lý file mồ côi có kiểm soát. Không giả định Storage và DB có transaction chung. Bỏ qua làm phát sinh ảnh thừa, gallery trùng hoặc thông báo lỗi khó hiểu. Phạm vi nhỏ–vừa ở hai form và helper upload.

7. **Kiểu dữ liệu và validation chưa bảo vệ đầu vào từ DB — mức vừa.**

   [order-pricing.ts:29](</Users/nghiabui/Webstorm Project/gungdetox/src/lib/order-pricing.ts:29>) giả định items luôn là mảng và từng phần tử hợp lệ; [loadOrders:331](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/don-hang.astro:331>) gọi nó cho toàn bộ danh sách. Chỉ một đơn có items=[null] đủ làm quá trình tải lỗi; đã tái hiện. RPC chỉ kiểm tra items là mảng không rỗng, chưa kiểm tra từng item. TypeScript any và ép kiểu không xác thực JSON lúc chạy.

   Xác thực item tại RPC và khi nhận dữ liệu cũ; dùng type chung cho order/product. Hiển thị rõ bản ghi lỗi thay vì làm hỏng cả bảng. Bỏ qua gây gián đoạn quản lý bởi dữ liệu sai cấu trúc. Phạm vi trung bình; không cần thêm một hệ thống validation tổng quát.

**Nên sửa**

8. **Danh sách đơn giả định một request chứa toàn bộ dữ liệu.**

   [loadOrders:326](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/don-hang.astro:326>) không phân trang; CSV xuất từ allOrders và nhãn khách quen tính trên cùng tập dữ liệu. Khi vượt giới hạn trả về của API, export thiếu đơn và số lần mua có thể sai. [orderCountByPhoneUpTo:130](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/don-hang.astro:130>) còn quét toàn danh sách cho mỗi dòng: khoảng n² lượt so sánh.

   Phân trang bảng, export có vòng tải đủ trang và tính số lần mua từ nguồn dữ liệu đầy đủ. Với tập dữ liệu đã tải, có thể tính trước bằng Map. Bỏ qua sẽ làm báo cáo thiếu dữ liệu khi lượng đơn tăng. Chưa đo độ chậm thực tế hoặc kiểm tra API cap của project trong đợt này. Supabase có giới hạn số dòng mỗi response; xem [tài liệu giới hạn phía API](https://supabase.com/docs/reference/python/select). Phạm vi nhỏ–vừa.

9. **Dùng câu tiếng Việt làm cấu trúc dữ liệu.**

   [Checkout:614](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/dat-hang.astro:614>) ghép ngày, giờ, ghi chú và thông tin thanh toán vào shipping_fee_note. [Parser:41](</Users/nghiabui/Webstorm Project/gungdetox/src/lib/order-details.ts:41>) và email tách lại bằng regex. Ghi chú “Gọi trước. Phí ship tôi trả” bị cắt còn “Gọi trước”; đã tái hiện. Đổi câu hiển thị cũng có thể phá parser.

   Thêm field có cấu trúc cho đơn mới, giữ parser legacy cho đơn cũ. Không cần sửa toàn bộ đơn lịch sử ngay. Bỏ qua khiến thay đổi nội dung giao diện kéo theo lỗi dữ liệu. Đây là phần có phạm vi lan rộng nhất: checkout, RPC/schema, admin list/detail, email, test và tương thích dữ liệu cũ.

10. **Luồng gallery và form sản phẩm/blog bị sao chép.**

   [Sản phẩm:138](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/san-pham.astro:138>) và [blog:103](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/admin/blog.astro:103>) có ít nhất 51 dòng script giống hệt trong các cụm dài; còn nhiều logic upload/reset tương tự. Sửa lỗi retry hoặc preview phải nhớ sửa hai bản.

   Tái dùng helper gallery/upload nhỏ theo mô hình initMainImagePreview hiện có; giữ payload nghiệp vụ riêng. Không xây một CRUD framework. Bỏ qua tiếp tục làm hai form lệch hành vi. Phạm vi nhỏ–vừa, khoảng hai trang và một đến hai helper/test.

11. **Một số page script làm quá nhiều việc và phụ thuộc chặt vào markup.**

   [Checkout:292](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/dat-hang.astro:292>) chứa state, validation, render, query và lưu đơn trong 455 dòng script. renderCart dài khoảng 61 dòng; handler lưu sản phẩm khoảng 71 dòng; render bảng đơn khoảng 79 dòng. Thay ID DOM hoặc cấu trúc con có thể phá handler. Logic chép data-astro-cid-* cũng xuất hiện ở nhiều trang.

   Tách theo việc cần test: chuẩn hóa dữ liệu checkout, điều khiển gallery, dựng bảng/CSV. Dùng template DOM hoặc CSS có scope rõ cho phần tử động để giảm việc chép attribute của compiler. Bỏ qua làm một chỉnh sửa UI phải rà nhiều trạng thái và side effect. Phạm vi vừa nhưng cục bộ; không nên tách tất cả file dài chỉ vì số dòng, nhất là index/khoa-hoc vốn chủ yếu là CSS.

12. **Hàng rào kiểm tra tự động chưa theo kịp luồng rủi ro.**

   [package.json](</Users/nghiabui/Webstorm Project/gungdetox/package.json>) không có lint/typecheck script; typescript và @astrojs/check chưa được cài trong repo. [Workflow website](</Users/nghiabui/Webstorm Project/gungdetox/.github/workflows/deploy.yml>) build rồi deploy, không chạy unit test. Workflow email có chạy test riêng, nhưng không bảo vệ thay đổi checkout/admin.

   Đưa test, lint và astro check vào kiểm tra trước deploy; giữ vài integration test có fixture cho checkout, quyền admin, upload lỗi và cập nhật đồng thời. 117 script .verify không thay thế bộ test này: ví dụ [check-order-flow.mjs](</Users/nghiabui/Webstorm Project/gungdetox/.verify/check-order-flow.mjs>) dùng ngày cố định, có thể tạo đơn thật; nhiều script chỉ chụp ảnh/in log. Bỏ qua khiến build xanh tạo cảm giác an toàn giả. [Astro build không thực hiện typecheck](https://docs.astro.build/en/guides/typescript/#type-checking). Phạm vi vừa; không cần chuyển toàn bộ 117 script thành test.

13. **Thiết lập DB và tài liệu chưa có một quy trình tái lập thống nhất.**

   SQL nằm rải trong supabase, phải chạy theo thứ tự và có sẵn ba tài khoản/trigger webhook. [Migration xác nhận:30](</Users/nghiabui/Webstorm Project/gungdetox/supabase/payment-receipt-confirmation.sql:30>) phụ thuộc trigger đã tồn tại. README còn mô tả checkout dùng insert().select() dù code đã chuyển sang RPC. Một người dựng môi trường mới chỉ chạy schema.sql sẽ thiếu phần checkout hiện tại.

   Chuẩn hóa thứ tự migration/bootstrap, tách bước nhập secret khỏi schema, sửa mô tả cũ và kiểm tra trên DB rỗng. Bỏ qua làm staging/test khó tái lập và tăng nguy cơ lệch schema giữa môi trường. Đây là nợ vận hành, chưa kết luận quá trình dựng mới đang thất bại vì chưa thực hiện thử. Phạm vi nhỏ–vừa; schema nghiệp vụ có thể giữ nguyên.

**Dọn nhẹ**

14. **Có code tham chiếu không chạy và một phép sort không làm gì.**

   ProductCard.astro, ComboCard.astro, SetDetoxCard.astro, BlogCard.astro có tổng cộng 179 dòng, không có import trong repo. README/plan xác nhận chúng được giữ làm tham chiếu, trong khi templates.ts mới là bản chạy thực tế. [san-pham.astro:320](</Users/nghiabui/Webstorm Project/gungdetox/src/pages/san-pham.astro:320>) dùng comparator luôn trả 0.

   Đưa thông tin tham chiếu cần thiết vào tài liệu rồi bỏ các bản không chạy khi được duyệt; bỏ sort vô hiệu. Nếu giữ, người sửa nhầm component có thể không thấy thay đổi trên website. Phạm vi nhỏ, rủi ro thấp sau khi kiểm tra references. Không cần dọn toàn bộ CSS hay script lịch sử cùng đợt.

**Phạm vi và công sức dự kiến**

| Gói công việc | Phạm vi dự kiến | Công sức |
| --- | --- | --- |
| Clean code thuần: gộp gallery, tách trách nhiệm cần test, type chung, dọn code tham chiếu và tài liệu | Khoảng 10–15 file, chủ yếu frontend/helper/test | 3–5 ngày công |
| Sửa lỗi nghiệp vụ và bảo mật trọng yếu, thêm test và kiểm tra trước deploy | Khoảng 12–20 file, gồm SQL/RPC và cấu hình | 4–7 ngày công |
| Cả hai, thêm phân trang, chuẩn hóa dữ liệu giao hàng và regression trên staging | Khoảng 20–30 file tổng cộng; nhiều file là test/migration | 8–12 ngày công |

Các gói có phần chồng nhau, không cộng số file hoặc số ngày trực tiếp. Ước lượng cho một lập trình viên quen repo, có quyền staging/Supabase, giữ nguyên giao diện và quy tắc kinh doanh, gồm thời gian review và kiểm thử. Chưa phải cam kết lịch. Nếu thêm OTP tra cứu khách, thay đổi quy trình thanh toán hoặc cần làm sạch dữ liệu cũ phức tạp, phải ước lượng riêng. Xử lý lịch sử Git và kiểm tra phạm vi lộ credential cũng chưa nằm trong con số trên.

Thứ tự hợp lý: credential và quyền dữ liệu; đầu ra HTML/CSV; lỗi ghi dữ liệu/validation/build; test và CI; sau đó mới gộp/tách code. Phần dễ nhất là dọn component tham chiếu. Phần cần thận trọng nhất là quyền tra cứu và chuyển shipping_fee_note sang dữ liệu có cấu trúc vì liên quan nhiều caller và đơn cũ.

Nên chia thành các thay đổi nhỏ, mỗi thay đổi có test hành vi. Tiêu chí nghiệm thu quan trọng: user ngoài admin bị từ chối ở DB; lỗi query chặn build; retry upload không nhân đôi ảnh; hai admin không làm mất lịch sử; một đơn lỗi không làm hỏng danh sách; export đủ dữ liệu vượt một trang; đơn cũ vẫn đọc được sau migration.

**Bằng chứng kiểm tra**

- Đã chạy 45/45 test bằng node --experimental-strip-types --test --test-reporter=dot tests/*.test.mjs; exit code 0.
- npm run build pass, tạo 54 trang. Không thay đổi source ứng dụng hoặc dữ liệu production.
- Assertion bổ sung với dữ liệu giả xác nhận: mất lịch sử do bản sao cũ; items=[null] làm lỗi resolver; dấu phân cách trong ghi chú làm mất phần hiển thị; hai getStaticPaths trả route rỗng khi Supabase báo lỗi.
- Đã xác nhận 5 vị trí credential hardcode là file tracked và kiểm tra references của bốn component card trên toàn cây repo. Chưa quét toàn bộ lịch sử Git hoặc thử credential.
- Lint/typecheck: chưa có công cụ/cấu hình tương ứng trong repo nên không báo pass. Chưa đo coverage, clone ratio hoặc cyclomatic complexity bằng công cụ chuyên dụng.

**Kết luận triển khai:** nền tảng và các helper gần đây đủ tốt để sửa tăng dần. Ưu tiên tính đúng và quyền dữ liệu trước việc làm code ngắn hơn. Khối lượng ở mức vừa; rủi ro tập trung ở migration và các luồng ghi dữ liệu.

**Khả năng tinh gọn:** có thể giảm khoảng 180 dòng từ các file tham chiếu/sort sau khi duyệt; gộp code lặp có thể giảm thêm nhưng chưa có diff để định lượng chính xác. Chưa có dependency nào được đề xuất bỏ chắc chắn. Tổng số dòng có thể tăng do bổ sung test và validation.

**Chưa kiểm tra:** không chạy lại toàn bộ UI/E2E, không benchmark tải lớn, không chạy test SQL có ghi dữ liệu, không dựng DB mới, không kiểm tra lại cấu hình production hoặc audit dependency trong đợt này. Đã đọc sâu các luồng checkout/admin/helper/SQL/email/deploy/test; các trang nội dung, CSS và .verify được rà cấu trúc/tìm mẫu, không review từng dòng hoặc từng tài sản ảnh. Chỉ thêm file báo cáo này.
