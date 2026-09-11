// Hàm tạo HTML cho các loại thẻ, dùng khi render dữ liệu fetch động từ Supabase
// phía trình duyệt (Astro component .astro không gọi được từ client-side JS).
// Markup/class phải khớp với CSS global trong src/components/*.astro tương ứng.

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
  video_url?: string | null;
  in_stock?: boolean;
}

export interface PostRow {
  slug: string;
  title: string;
  tag?: string | null;
  read_time?: string | null;
  image_url?: string | null;
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

function money(n?: number | null) {
  return n != null ? `${n.toLocaleString("vi-VN")}đ` : "Đang cập nhật giá";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function productCardHtml(p: ProductRow): string {
  const badge = p.badge
    ? `<span class="badge badge-${p.badge}">${badgeLabel[p.badge] ?? p.badge}</span>`
    : "";
  return `
    <article class="product-card${p.in_stock === false ? " out-of-stock" : ""}">
      <div class="media">
        ${p.image_url ? `<img src="${p.image_url}" alt="${esc(p.name)}" loading="lazy" />` : `<div class="media-placeholder"></div>`}
        ${p.video_url ? `<video src="${p.video_url}" muted loop playsinline class="hover-video"></video>` : ""}
        ${badge}
      </div>
      <div class="body">
        <h3>${esc(p.name)}</h3>
        ${p.description ? `<p class="description">${esc(p.description)}</p>` : ""}
        ${p.origin_story ? `<p class="origin">${esc(p.origin_story)}</p>` : ""}
        ${p.volume ? `<p class="volume">${esc(p.volume)}</p>` : ""}
        <div class="footer-row">
          <span class="price">${money(p.price_retail)}</span>
          <a class="cta" href="/dat-hang?product=${encodeURIComponent(p.slug)}">Đặt món này</a>
        </div>
      </div>
    </article>
  `;
}

export function comboCardHtml(p: ProductRow): string {
  const bottleOptions = p.bottle_options ?? [];
  return `
    <article class="combo-card">
      ${p.badge ? `<span class="badge">${badgeLabel[p.badge] ?? p.badge}</span>` : ""}
      <h3>${esc(p.name)}</h3>
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
      <a class="cta" href="/dat-hang?product=${encodeURIComponent(p.slug)}">Chọn combo này</a>
    </article>
  `;
}

export function setDetoxCardHtml(p: ProductRow, setNumber: number): string {
  return `
    <article class="set-card theme-${p.color_theme ?? "green"}">
      <span class="set-number">SET ${setNumber}</span>
      ${p.badge ? `<span class="badge">${p.badge === "best-seller" ? "Best Seller" : p.badge}</span>` : ""}
      <h3>${esc(p.name)}</h3>
      <p class="goal">${esc(p.set_goal ?? "")}</p>
      <p class="price">${money(p.price)}<span> / set (7 chai)</span></p>
      <a class="cta" href="/dat-hang?product=${encodeURIComponent(p.slug)}">Chọn set này</a>
    </article>
  `;
}

export function blogCardHtml(post: PostRow): string {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("vi-VN")
    : "";
  return `
    <a class="blog-card" href="/blog/${post.slug}">
      <div class="media">
        ${post.image_url ? `<img src="${post.image_url}" alt="${esc(post.title)}" loading="lazy" />` : `<div class="media-placeholder"></div>`}
        ${post.video_url ? `<video src="${post.video_url}" muted loop playsinline class="hover-video"></video>` : ""}
      </div>
      <div class="body">
        ${post.tag ? `<span class="tag">${esc(post.tag)}</span>` : ""}
        <h3>${esc(post.title)}</h3>
        <p class="meta">${formattedDate}${post.read_time ? ` · ${esc(post.read_time)}` : ""}</p>
      </div>
    </a>
  `;
}
