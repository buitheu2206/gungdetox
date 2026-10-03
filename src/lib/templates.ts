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

const fbIconSvg =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 1.88 6.48 1.88 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.42V9.91c0-2.39 1.42-3.71 3.6-3.71 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.74-1.55 1.49v1.79h2.64l-.42 2.91h-2.22V22c4.78-.76 8.44-4.92 8.44-9.94Z"/></svg>';

// Phải khớp với `site` trong astro.config.mjs. Luôn dùng domain thật cố định
// thay vì location.origin — nếu không, link share build lúc dev (localhost)
// sẽ không mở được trên Facebook (Facebook không bò được localhost), khác với
// blog/[slug].astro vốn build link share bằng Astro.site lúc build nên luôn
// đúng domain thật bất kể xem từ đâu.
const SITE_ORIGIN = "https://gungdetox.com";

// Nút chia sẻ sản phẩm lên Facebook trên card — link chia sẻ luôn là trang chi
// tiết sản phẩm (/san-pham/<slug>), không phải trang /san-pham chung.
function fbShareButtonHtml(path: string, extraClass = ""): string {
  const url = `${SITE_ORIGIN}${path}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  return `<a class="share-fb-btn${extraClass ? ` ${extraClass}` : ""}" href="${fbUrl}" target="_blank" rel="noopener noreferrer" title="Chia sẻ lên Facebook" aria-label="Chia sẻ lên Facebook">${fbIconSvg}</a>`;
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
            ${fbShareButtonHtml(`/san-pham/${p.slug}`)}
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
        ${fbShareButtonHtml(`/san-pham/${p.slug}`)}
      </div>
    </article>
  `;
}

// Gộp nhiều sản phẩm cùng dòng (khác nhau ở số lượng, vd. combo 3/5/7 chai Sữa hạt)
// thành 1 card duy nhất với nút chọn — thay vì mỗi mức số lượng 1 card riêng.
// `variants` phải được sắp theo thứ tự muốn hiển thị (vd. servings tăng dần).
export function comboVariantGroupCardHtml(name: string, variants: ProductRow[]): string {
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
        <legend>Chọn số chai</legend>
        ${variants
          .map(
            (p, i) =>
              `<label><input type="radio" name="variant-${esc(first.slug)}" value="${i}" ${i === 0 ? "checked" : ""}/> ${p.servings ? `${p.servings} chai` : esc(p.name)}</label>`
          )
          .join("")}
      </fieldset>
      <p class="note">Giá chưa gồm phí ship</p>
      <div class="cta-row">
        <a class="cta variant-cta" href="/dat-hang?product=${encodeURIComponent(first.slug)}">Chọn combo này</a>
        ${fbShareButtonHtml(`/san-pham/${first.slug}`, "variant-share")}
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
        ${fbShareButtonHtml(`/san-pham/${p.slug}`)}
      </div>
    </article>
  `;
}

export function blogCardHtml(post: PostRow): string {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("vi-VN")
    : "";
  return `
    <a class="blog-card" href="/blog/${encodeURIComponent(post.slug)}">
      <div class="blog-media">
        ${post.image_url ? `<img src="${post.image_url}" alt="${esc(post.title)}" loading="lazy" />` : `<div class="blog-media-placeholder"></div>`}
        ${post.video_url ? `<video src="${post.video_url}" muted loop playsinline class="blog-hover-video"></video>` : ""}
      </div>
      <div class="blog-body">
        ${post.tag ? `<span class="tag">${esc(tagLabel[post.tag] ?? post.tag)}</span>` : ""}
        <h3>${esc(post.title)}</h3>
        <p class="blog-meta">${formattedDate}${post.read_time ? ` · ${esc(post.read_time)}` : ""}</p>
      </div>
    </a>
  `;
}
