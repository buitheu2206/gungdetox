// Availability is a daily on/off flag, checked again before showing payment details.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductRow } from "./templates";

export function getInitialCheckoutItem(search: string, products: Pick<ProductRow, "slug">[]) {
  const params = new URLSearchParams(search);
  const product = products.find((item) => item.slug === params.get("product"));
  if (!product) return null;
  const requestedQuantity = Number(params.get("quantity") ?? 1);
  const quantity = Number.isSafeInteger(requestedQuantity) && requestedQuantity > 0 ? requestedQuantity : 1;
  return { slug: product.slug, quantity };
}

export async function getCheckoutProducts(client: SupabaseClient): Promise<ProductRow[]> {
  const { data, error } = await client.from("products")
    .select("slug, type, name, price, price_retail, bottle_options, image_url, in_stock")
    .eq("in_stock", true).order("sort_order");
  if (error) throw new Error("Không tải được sản phẩm. Vui lòng thử lại.", { cause: error });
  return data ?? [];
}

export async function assertCheckoutAvailable(client: SupabaseClient, cart: { slug: string }[]) {
  if (!cart.length) throw new Error("Vui lòng chọn sản phẩm trước khi thanh toán.");
  const { data, error } = await client.from("products").select("slug, name, in_stock")
    .in("slug", cart.map((item) => item.slug));
  if (error || !data) throw new Error("Không kiểm tra được sản phẩm. Vui lòng thử lại trước khi chuyển khoản.", { cause: error });
  const unavailable = cart.find((item) => !data.some((product) => product.slug === item.slug && product.in_stock === true));
  if (!unavailable) return;
  const name = data.find((product) => product.slug === unavailable.slug)?.name ?? unavailable.slug;
  throw new Error(`${name} hiện không còn bán. Vui lòng bỏ sản phẩm khỏi giỏ trước khi thanh toán.`);
}
