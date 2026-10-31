// Detox package definitions shared by the storefront and product setup script.
import type { ProductRow } from "./templates.ts";

export const DETOX_BOTTLES_PER_DAY = 5;
export const DETOX_PACKAGE_IMAGE = "/images/products/detox-5-chai-moi-ngay.webp";

export const detoxPackages = [
  { days: 7, price: 1750000, slug: "detox-5-chai-7-ngay" },
  { days: 5, price: 1250000, slug: "detox-5-chai-5-ngay" },
  { days: 3, price: 750000, slug: "detox-5-chai-3-ngay" },
  { days: 1, price: 269000, slug: "detox-5-chai-1-ngay" },
];

export function getDetoxPackageProducts(): ProductRow[] {
  return detoxPackages.map((packageOption) => ({
    slug: packageOption.slug,
    type: "combo",
    name: `Detox ${packageOption.days} ngày — ${DETOX_BOTTLES_PER_DAY} chai/ngày`,
    category: "set-detox",
    description: "Juice + Smoothie + Sữa hạt, menu thay đổi theo ngày và theo mùa.",
    volume: `${DETOX_BOTTLES_PER_DAY} chai/ngày`,
    price: packageOption.price,
    servings: packageOption.days * DETOX_BOTTLES_PER_DAY,
    bottle_options: ["plastic"],
    image_url: DETOX_PACKAGE_IMAGE,
    in_stock: true,
  }));
}
