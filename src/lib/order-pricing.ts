// Order items keep the checkout price so later product edits do not change past totals.
import type { ProductRow } from "./templates";

export interface OrderItem {
  productSlug: string;
  quantity: number;
  unitPrice?: number | null;
}

type PricedProduct = Pick<ProductRow, "slug" | "type" | "price" | "price_retail">;

export function getProductUnitPrice(product: PricedProduct): number | null {
  const price = product.type === "single" ? product.price_retail : product.price;
  return typeof price === "number" && Number.isFinite(price) && price >= 0 ? price : null;
}

export function snapshotOrderItems(cart: { slug: string; quantity: number }[], products: PricedProduct[]): OrderItem[] {
  return cart.map((item) => {
    const product = products.find((product) => product.slug === item.slug);
    return {
      productSlug: item.slug,
      quantity: item.quantity,
      unitPrice: product ? getProductUnitPrice(product) : null,
    };
  });
}

// Current prices are a display fallback for legacy orders, never a database backfill.
export function resolveOrderItems(items: unknown, products: PricedProduct[]): OrderItem[] {
  if (!isOrderItems(items)) return [];
  return items.map((item) => {
    if (item.unitPrice != null) return item;
    const product = products.find((product) => product.slug === item.productSlug);
    return { ...item, unitPrice: product ? getProductUnitPrice(product) : null };
  });
}

export function getOrderAmount(items: OrderItem[]): number | null {
  if (!Array.isArray(items) || !items.length) return null;
  let total = 0;
  for (const item of items) {
    if (!item || !Number.isInteger(item.quantity) || item.quantity <= 0
      || typeof item.unitPrice !== "number" || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) return null;
    total += item.unitPrice * item.quantity;
  }
  return Number.isFinite(total) ? total : null;
}

// Validate legacy JSON before any list/detail renderer dereferences its members.
export function isOrderItems(value: unknown): value is OrderItem[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) =>
    item && typeof item.productSlug === "string" && item.productSlug.trim().length > 0
    && Number.isSafeInteger(item.quantity) && item.quantity > 0);
}
