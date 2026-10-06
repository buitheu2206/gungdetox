// Hàm tạo HTML cho các loại thẻ, dùng khi render dữ liệu fetch động từ Supabase
// phía trình duyệt (Astro component .astro không gọi được từ client-side JS).
// Markup/class phải khớp với CSS global trong src/components/*.astro tương ứng.

// Mã đơn hiển thị cho khách/admin — không phải khoá chính thật (vẫn là uuid `orders.id`),
// chỉ để dễ đọc/dễ nói qua điện thoại: 6 số cuối SĐT + 6 ký tự đầu của id.
export function orderCode(phone: string, id: string): string {
  const phoneSuffix = phone.replace(/\D/g, "").slice(-6);
  const idPrefix = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `${phoneSuffix}-${idPrefix}`;
}

export interface ProductRow {
  slug: string;
  type: "single" | "combo" | "set";
  name: string;
  category?: string | null;
  description?: string | null;
  origin_story?: string | null;
  volume?: string | null;
  price_retail?: number | null;
  price?: number | null;
  servings?: number | null;
  delivery_schedule?: string | null;
  bottle_options?: string[] | null;
  set_goal?: string | null;
  color_theme?: string | null;
  badge?: string | null;
  image_url?: string | null;
  gallery_images?: string[] | null;
  video_url?: string | null;
  in_stock?: boolean;
}

export interface PostRow {
  slug: string;
  title: string;
  body?: string | null;
  tag?: string | null;
  read_time?: string | null;
  image_url?: string | null;
  gallery_images?: string[] | null;
  video_url?: string | null;
  published_at?: string | null;
}

const badgeLabel: Record<string, string> = {
  "best-seller": "Best-seller",
  new: "Mới",
  sale: "Sale",
  "out-of-stock": "Tạm hết",
};

const bottleLabel: Record<string, string> = {
  glass: "Thủy tinh",
  plastic: "Nhựa",
};

export const tagLabel: Record<string, string> = {
  "eat-clean": "Eat Clean",
  detox: "Detox",
  "cong-thuc": "Công thức",
  "song-khoe": "Sống khỏe",
};

function money(n?: number | null) {
  return n != null ? `${n.toLocaleString("vi-VN")}đ` : "Đang cập nhật giá";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Tách nội dung bài viết thành từng đoạn <p>. Bài viết thêm bằng tay qua trang
// admin đôi khi được dán nguyên caption Facebook — loại này chỉ có 1 dấu xuống
// dòng giữa các câu, không có dòng trống giữa các đoạn như văn bản thường, nên
// nếu tách theo "\n\n" (chuẩn) thì cả bài dính thành 1 khối văn bản dài, rất khó
// đọc. Phát hiện trường hợp này (không có dòng trống nào) và coi mỗi dòng là 1
// đoạn riêng thay vì dính cục — vẫn tôn trọng đúng ý người viết khi họ ĐÃ tự
// cách dòng trống giữa các đoạn (trường hợp bình thường, đa số bài viết).
export function splitIntoParagraphs(body?: string | null): string[] {
  const text = (body ?? "").trim();
  if (!text) return [];
  const hasBlankLineBreaks = /\n[ \t]*\n/.test(text);
  return text
    .split(hasBlankLineBreaks ? /\n[ \t]*\n+/ : /\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Trang admin/blog.astro dùng Quill (rich-text editor) nên bài viết MỚI lưu
// xuống cột `body` là HTML thật (đậm/gạch đầu dòng/link...), không còn văn bản
// thuần — render thẳng bằng set:html. Bài viết CŨ (thêm từ trước khi có Quill)
// vẫn là văn bản thuần không có thẻ HTML nào, nên phát hiện trường hợp đó và
// dùng lại splitIntoParagraphs để không vỡ layout các bài cũ.
export function renderPostBodyHtml(body?: string | null): string {
  const text = (body ?? "").trim();
  if (!text) return "";
  const isRichHtml = /<[a-z][\s\S]*>/i.test(text);
  if (isRichHtml) return text;
  return splitIntoParagraphs(text)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
}

const shareIconSvg =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"></line><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line></svg>';

// Phải khớp với `site` trong astro.config.mjs. Luôn dùng domain thật cố định
// thay vì location.origin — nếu không, link share build lúc dev (localhost)
// sẽ không mở được trên Facebook (Facebook không bò được localhost), khác với
// blog/[slug].astro vốn build link share bằng Astro.site lúc build nên luôn
// đúng domain thật bất kể xem từ đâu.
const SITE_ORIGIN = "https://gungdetox.com";

// Nút chia sẻ nhỏ trên card — mở ShareModal dùng chung toàn site (xem
// src/components/ShareModal.astro, đặt 1 lần trong BaseLayout) qua event
// delegation, nên card tạo bằng innerHTML (sau khi fetch Supabase) vẫn bắt được
// mà không cần tự gắn listener riêng. Link chia sẻ luôn là trang chi tiết sản
// phẩm (/san-pham/<slug>), không phải trang /san-pham chung.
function shareButtonHtml(path: string, title: string, extraClass = ""): string {
  const url = `${SITE_ORIGIN}${path}`;
  return `<button type="button" class="share-fb-btn${extraClass ? ` ${extraClass}` : ""}" data-share-trigger data-share-url="${url}" data-share-title="${esc(title)}" title="Chia sẻ" aria-label="Chia sẻ">${shareIconSvg}</button>`;
}

export function productCardHtml(p: ProductRow): string {
  const badge = p.badge
    ? `<span class="badge badge-${p.badge}">${badgeLabel[p.badge] ?? p.badge}</span>`
    : "";
  return `
    <article class="product-card${p.in_stock === false ? " out-of-stock" : ""}">
      <a class="media" href="/san-pham/${encodeURIComponent(p.slug)}">
        ${p.image_url ? `<img src="${p.image_url}" alt="${esc(p.name)}" loading="lazy" />` : `<div class="media-placeholder"></div>`}
        ${p.video_url ? `<video src="${p.video_url}" muted loop playsinline class="hover-video"></video>` : ""}
        ${badge}
      </a>
      <div class="body">
        <h3><a href="/san-pham/${encodeURIComponent(p.slug)}">${esc(p.name)}</a></h3>
        ${p.description ? `<p class="description">${esc(p.description)}</p>` : ""}
        ${p.origin_story ? `<p class="origin">${esc(p.origin_story)}</p>` : ""}
        ${p.volume ? `<p class="volume">${esc(p.volume)}</p>` : ""}
        <div class="footer-row">
          <span class="price">${money(p.price_retail)}</span>
          <div class="footer-actions">
            <a class="cta" href="/dat-hang?product=${encodeURIComponent(p.slug)}">Đặt món này</a>
            ${shareButtonHtml(`/san-pham/${p.slug}`, p.name)}
          </div>
        </div>
      </div>
    </article>
  `;
}

export function comboCardHtml(p: ProductRow): string {
  const bottleOptions = p.bottle_options ?? [];
  return `
    <article class="combo-card">
      ${p.image_url ? `<div class="media"><img src="${p.image_url}" alt="${esc(p.name)}" loading="lazy" /></div>` : ""}
      ${p.badge ? `<span class="badge">${badgeLabel[p.badge] ?? p.badge}</span>` : ""}
      <h3><a href="/san-pham/${encodeURIComponent(p.slug)}">${esc(p.name)}</a></h3>
      <p class="price">${money(p.price)}</p>
      ${
        p.servings
          ? `<p class="meta">${p.servings} lần uống${p.delivery_schedule ? ` · giao ${esc(p.delivery_schedule)}` : ""}</p>`
          : ""
      }
      ${
        bottleOptions.length > 0
          ? `<fieldset class="bottle-options"><legend>Chọn loại chai</legend>${bottleOptions
              .map(
                (o, i) =>
                  `<label><input type="radio" name="bottle-${p.slug}" value="${o}" ${i === 0 ? "checked" : ""}/> ${bottleLabel[o] ?? o}</label>`
              )
              .join("")}</fieldset>`
          : ""
      }
      <p class="note">Giá chưa gồm phí ship</p>
      <div class="cta-row">
        <a class="cta" href="/dat-hang?product=${encodeURIComponent(p.slug)}">Chọn combo này</a>
        ${shareButtonHtml(`/san-pham/${p.slug}`, p.name)}
      </div>
    </article>
  `;
}

// Gộp nhiều sản phẩm cùng dòng (khác nhau ở số lượng, vd. combo 3/5/7 chai Sữa hạt)
// thành 1 card duy nhất với nút chọn — thay vì mỗi mức số lượng 1 card riêng.
// `variants` phải được sắp theo thứ tự muốn hiển thị (vd. servings tăng dần).
export function comboVariantGroupCardHtml(name: string, variants: ProductRow[], labels?: string[]): string {
  const data = variants.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    servings: p.servings ?? null,
    image: p.image_url ?? null,
  }));
  const first = variants[0];
  const badge = first.badge
    ? `<span class="badge">${badgeLabel[first.badge] ?? first.badge}</span>`
    : "";
  return `
    <article class="combo-card variant-group" data-variants='${esc(JSON.stringify(data))}'>
      <div class="media">
        ${first.image_url ? `<img src="${first.image_url}" alt="${esc(name)}" loading="lazy" class="variant-image" />` : `<div class="media-placeholder"></div>`}
      </div>
      ${badge}
      <h3><a href="/san-pham/${encodeURIComponent(first.slug)}" class="variant-link">${esc(name)}</a></h3>
      <p class="price variant-price">${money(first.price)}</p>
      <fieldset class="variant-options">
        <legend>${labels ? "Chọn gói" : "Chọn số chai"}</legend>
        ${variants
          .map(
            (p, i) =>
              `<label><input type="radio" name="variant-${esc(first.slug)}" value="${i}" ${i === 0 ? "checked" : ""}/> ${labels?.[i] ? esc(labels[i]) : p.servings ? `${p.servings} chai` : esc(p.name)}</label>`
          )
          .join("")}
      </fieldset>
      <p class="note">Giá chưa gồm phí ship</p>
      <div class="cta-row">
        <a class="cta variant-cta" href="/dat-hang?product=${encodeURIComponent(first.slug)}">Chọn combo này</a>
        ${shareButtonHtml(`/san-pham/${first.slug}`, name, "variant-share")}
      </div>
    </article>
  `;
}

export function setDetoxCardHtml(p: ProductRow, setNumber: number): string {
  return `
    <article class="set-card theme-${p.color_theme ?? "green"}">
      <a class="media" href="/san-pham/${encodeURIComponent(p.slug)}">
        ${p.image_url ? `<img src="${p.image_url}" alt="${esc(p.name)}" loading="lazy" />` : `<div class="media-placeholder"></div>`}
      </a>
      <span class="set-number">SET ${setNumber}</span>
      ${p.badge ? `<span class="badge">${p.badge === "best-seller" ? "Best Seller" : p.badge}</span>` : ""}
      <h3><a href="/san-pham/${encodeURIComponent(p.slug)}">${esc(p.name)}</a></h3>
      <p class="goal">${esc(p.set_goal ?? "")}</p>
      <p class="price">${money(p.price)}<span> / set (7 chai)</span></p>
      <div class="cta-row">
        <a class="cta" href="/dat-hang?product=${encodeURIComponent(p.slug)}">Chọn set này</a>
        ${shareButtonHtml(`/san-pham/${p.slug}`, p.name)}
      </div>
    </article>
  `;
}

export function blogCardHtml(post: PostRow): string {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("vi-VN")
    : "";
  const href = `/blog/${encodeURIComponent(post.slug)}`;
  return `
    <article class="blog-card">
      <a class="blog-media-link" href="${href}">
        <div class="blog-media">
          ${post.image_url ? `<img src="${post.image_url}" alt="${esc(post.title)}" loading="lazy" />` : `<div class="blog-media-placeholder"></div>`}
          ${post.video_url ? `<video src="${post.video_url}" muted loop playsinline class="blog-hover-video"></video>` : ""}
        </div>
      </a>
      <div class="blog-body">
        ${post.tag ? `<span class="tag">${esc(tagLabel[post.tag] ?? post.tag)}</span>` : ""}
        <h3><a href="${href}">${esc(post.title)}</a></h3>
        <div class="blog-footer-row">
          <p class="blog-meta">${formattedDate}${post.read_time ? ` · ${esc(post.read_time)}` : ""}</p>
          ${shareButtonHtml(href, post.title)}
        </div>
      </div>
    </article>
  `;
}
