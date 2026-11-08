import { getOrderDelivery, type DeliveryFields } from "../_shared/order-delivery.ts";
// Server-only notification handler; recipients always come from configuration.
interface NotificationConfig {
  webhookSecret: string;
  apiKey: string;
  from: string;
  recipients: string;
  emailTemplate: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

interface Order extends DeliveryFields {
  id: string;
  phone: string;
  customer_name: string;
  items: { productSlug: string; quantity: number }[];
  address?: string;
  district?: string;
  shipping_fee_note?: string;
  payment_receipt_submitted_at?: string | null;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const ORDER_DETAILS_ORIGIN = "https://gungdetox.com/don-hang/";
const EMAIL_TIMEOUT_MS = 15_000;
// Lookup + Resend (15s) must finish inside the 20s database webhook timeout.
const PRODUCT_LOOKUP_TIMEOUT_MS = 3_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

function parseOrder(payload: unknown): Order | null {
  const event = payload as { type?: string; table?: string; schema?: string; record?: Order; old_record?: Order } | null;
  const order = event?.record;
  if (event?.table !== "orders" || event.schema !== "public" || !order || !["INSERT", "UPDATE"].includes(event.type ?? "")) {
    throw new Error("Expected an orders webhook for public.orders.");
  }
  if (event.type !== "INSERT" || !order.payment_receipt_submitted_at) return null;
  if (typeof order.payment_receipt_submitted_at !== "string" || !Number.isFinite(Date.parse(order.payment_receipt_submitted_at))) {
    throw new Error("Receipt confirmation must include a valid submission timestamp.");
  }
  if (typeof order.id !== "string" || !UUID_PATTERN.test(order.id)
    || typeof order.phone !== "string" || !order.phone.trim()
    || typeof order.customer_name !== "string" || !order.customer_name.trim()
    || !Array.isArray(order.items) || !order.items.length
    || order.items.some((item) => !item || typeof item.productSlug !== "string"
      || !item.productSlug.trim() || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
    throw new Error("Order must include a valid ID, customer, phone and product quantities.");
  }
  for (const field of [order.address, order.district, order.shipping_fee_note, order.delivery_date, order.delivery_time, order.delivery_note]) {
    if (field != null && typeof field !== "string") throw new Error("Order delivery details must be text.");
  }
  return order;
}

// Orders store only productSlug; the customer-facing name lives in products.
// Falls back to the slug so a lookup failure never blocks the notification.
async function fetchProductNames(items: Order["items"], config: NotificationConfig): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.warn("Product names unavailable in order email: set SUPABASE_URL and SUPABASE_ANON_KEY for the function.");
    return names;
  }
  try {
    const slugs = items.map((item) => `"${item.productSlug.replace(/(["\\])/g, "\\$1")}"`).join(",");
    const response = await fetch(`${config.supabaseUrl}/rest/v1/products?select=slug,name&slug=in.(${encodeURIComponent(slugs)})`, {
      headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${config.supabaseAnonKey}` },
      signal: AbortSignal.timeout(PRODUCT_LOOKUP_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Products lookup returned ${response.status}`);
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error("Products lookup did not return a list");
    for (const product of products) {
      if (typeof product?.slug === "string" && typeof product.name === "string") names.set(product.slug, product.name);
    }
  } catch (error) {
    console.error("Could not load product names for order email; showing product slugs instead", { error });
  }
  return names;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

interface EmailProduct {
  name: string;
  quantity: number;
}

interface EmailDetails {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryTime: string;
}

function buildEmailHtml(template: string, code: string, details: EmailDetails, products: EmailProduct[]): string {
  const values: Record<string, string> = {
    order_code: escapeHtml(code),
    customer_name: escapeHtml(details.customerName),
    customer_phone: escapeHtml(details.customerPhone),
    delivery_address: escapeHtml(details.deliveryAddress),
    delivery_time: escapeHtml(details.deliveryTime),
    order_details_url: `${ORDER_DETAILS_ORIGIN}${encodeURIComponent(code)}`,
    product_rows: products.map((product) => `<tr>
      <td style="padding:14px 16px;border-bottom:1px solid #f5f0e6;overflow-wrap:anywhere;">${escapeHtml(product.name)}</td>
      <td align="center" style="padding:14px 16px;border-bottom:1px solid #f5f0e6;font-weight:600;color:#4e6735;">${product.quantity}</td>
    </tr>`).join(""),
  };
  return template.replace(/\{\{([a-z_]+)\}\}/g, (_, key: string) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Unknown email template field: ${key}`);
    return values[key];
  });
}

function buildEmail(order: Order, config: NotificationConfig, names: Map<string, string>) {
  const recipients = config.recipients.split(",").map((email) => email.trim());
  if (recipients.some((email) => !EMAIL_PATTERN.test(email))) {
    throw new Error("Set ORDER_NOTIFICATION_TO to valid comma-separated email addresses.");
  }
  const code = `${order.phone.replace(/\D/g, "").slice(-6)}-${order.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const deliveryTime = getOrderDelivery(order).schedule;
  const details = {
    customerName: order.customer_name,
    customerPhone: order.phone,
    deliveryAddress: [order.address, order.district].filter(Boolean).join(", ") || "Chưa có thông tin",
    deliveryTime,
  };
  const products = order.items.map((item) => ({ name: names.get(item.productSlug) ?? item.productSlug, quantity: item.quantity }));
  return {
    from: config.from,
    to: recipients,
    subject: `[GỪNG DETOX] Đơn hàng mới ${code}`,
    html: buildEmailHtml(config.emailTemplate, code, details, products),
    text: [
      `Có đơn hàng mới: ${code}`,
      `Tên khách hàng: ${details.customerName}`,
      `SĐT khách hàng: ${details.customerPhone}`,
      `Địa chỉ giao hàng: ${details.deliveryAddress}`,
      `Thời điểm nhận hàng: ${details.deliveryTime}`,
      "Sản phẩm:",
      ...products.map((product) => `- ${product.name} × ${product.quantity}`),
      `Thông tin giao hàng: ${order.shipping_fee_note || "—"}`,
      `Chi tiết đơn hàng: ${ORDER_DETAILS_ORIGIN}${encodeURIComponent(code)}`,
    ].join("\n"),
  };
}

async function sendEmail(order: Order, config: NotificationConfig): Promise<string> {
  const names = await fetchProductNames(order.items, config);
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `order-receipt-notification/${order.id}`,
    },
    body: JSON.stringify(buildEmail(order, config, names)),
    signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
  });
  const result = await response.json();
  if (!response.ok || typeof result?.id !== "string") {
    throw new Error(`Resend rejected order notification (${response.status}): ${result?.message ?? "missing email ID"}`);
  }
  return result.id;
}

export async function handleOrderNotification(
  request: Request, config: NotificationConfig,
): Promise<Response> {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!config.webhookSecret) {
    console.error("Order notification webhook secret missing: set ORDER_WEBHOOK_SECRET in Supabase Secrets.");
    return new Response("Webhook secret is not configured", { status: 503 });
  }
  if (request.headers.get("x-order-webhook-secret") !== config.webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!config.apiKey || !config.from || !config.recipients || !config.emailTemplate) {
    console.error("Order notification configuration missing: set Resend key, sender and recipients in Supabase Secrets.");
    return new Response("Email service is not configured", { status: 503 });
  }
  let order: Order | null;
  try {
    order = parseOrder(await request.json());
  } catch (error) {
    console.error("Invalid order notification webhook", { error });
    return new Response("Invalid order webhook", { status: 400 });
  }
  if (!order) return Response.json({ ignored: true });
  try {
    const emailId = await sendEmail(order, config);
    console.info("Order notification accepted by Resend", { orderId: order.id, emailId });
    return Response.json({ emailId });
  } catch (error) {
    console.error("Order notification failed; check Resend configuration and resend this order webhook", { orderId: order.id, error });
    return new Response("Email notification failed", { status: 502 });
  }
}
