// Server-only notification handler; recipients always come from configuration.
interface NotificationConfig {
  webhookSecret: string;
  apiKey: string;
  from: string;
  recipients: string;
  emailTemplate: string;
}

interface Order {
  id: string;
  phone: string;
  customer_name: string;
  items: { productSlug: string; quantity: number }[];
  address?: string;
  district?: string;
  shipping_fee_note?: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const ADMIN_ORDERS_URL = "https://gungdetox.com/admin/don-hang";
const EMAIL_TIMEOUT_MS = 15_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

function parseOrder(payload: unknown): Order {
  const event = payload as { type?: string; table?: string; schema?: string; record?: Order } | null;
  const order = event?.record;
  if (event?.type !== "INSERT" || event.table !== "orders" || event.schema !== "public" || !order) {
    throw new Error("Expected an INSERT webhook for public.orders.");
  }
  if (typeof order.id !== "string" || !UUID_PATTERN.test(order.id)
    || typeof order.phone !== "string" || !order.phone.trim()
    || typeof order.customer_name !== "string" || !order.customer_name.trim()
    || !Array.isArray(order.items) || !order.items.length
    || order.items.some((item) => !item || typeof item.productSlug !== "string"
      || !item.productSlug.trim() || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
    throw new Error("Order must include a valid ID, customer, phone and product quantities.");
  }
  for (const field of [order.address, order.district, order.shipping_fee_note]) {
    if (field != null && typeof field !== "string") throw new Error("Order delivery details must be text.");
  }
  return order;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

interface EmailDetails {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryTime: string;
}

function buildEmailHtml(template: string, code: string, details: EmailDetails, items: Order["items"]): string {
  const values: Record<string, string> = {
    order_code: escapeHtml(code),
    customer_name: escapeHtml(details.customerName),
    customer_phone: escapeHtml(details.customerPhone),
    delivery_address: escapeHtml(details.deliveryAddress),
    delivery_time: escapeHtml(details.deliveryTime),
    admin_orders_url: ADMIN_ORDERS_URL,
    product_rows: items.map((item) => `<tr>
      <td style="padding:14px 16px;border-bottom:1px solid #f5f0e6;overflow-wrap:anywhere;">${escapeHtml(item.productSlug)}</td>
      <td align="center" style="padding:14px 16px;border-bottom:1px solid #f5f0e6;font-weight:600;color:#4e6735;">${item.quantity}</td>
    </tr>`).join(""),
  };
  return template.replace(/\{\{([a-z_]+)\}\}/g, (_, key: string) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Unknown email template field: ${key}`);
    return values[key];
  });
}

function buildEmail(order: Order, config: NotificationConfig) {
  const recipients = config.recipients.split(",").map((email) => email.trim());
  if (!recipients.length || recipients.some((email) => !EMAIL_PATTERN.test(email))) {
    throw new Error("Set ORDER_NOTIFICATION_TO to valid comma-separated email addresses.");
  }
  const code = `${order.phone.replace(/\D/g, "").slice(-6)}-${order.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  // Checkout currently stores the selected delivery date and time in this note.
  const deliveryTime = order.shipping_fee_note?.match(/Giao ngày (.+?)\. Ghi chú của khách:/)?.[1] ?? "Chưa có thông tin";
  const details = {
    customerName: order.customer_name,
    customerPhone: order.phone,
    deliveryAddress: [order.address, order.district].filter(Boolean).join(", ") || "Chưa có thông tin",
    deliveryTime,
  };
  return {
    from: config.from,
    to: recipients,
    subject: `[GỪNG DETOX] Có đơn mới ${code}`,
    html: buildEmailHtml(config.emailTemplate, code, details, order.items),
    text: [
      `Đơn hàng mới: ${code}`,
      "GỪNG DETOX vừa nhận được một đơn hàng mới. Vui lòng kiểm tra thông tin và liên hệ khách hàng để xác nhận.",
      `Tên khách hàng: ${details.customerName}`,
      `SĐT khách hàng: ${details.customerPhone}`,
      `Địa chỉ giao hàng: ${details.deliveryAddress}`,
      `Thời điểm nhận hàng: ${details.deliveryTime}`,
      "Sản phẩm:",
      ...order.items.map((item) => `- ${item.productSlug} × ${item.quantity}`),
      `Thông tin giao hàng: ${order.shipping_fee_note || "—"}`,
      `Quản lý đơn hàng: ${ADMIN_ORDERS_URL}`,
    ].join("\n"),
  };
}

async function sendEmail(order: Order, config: NotificationConfig, fetcher: typeof fetch): Promise<string> {
  const response = await fetcher(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `order-notification/${order.id}`,
    },
    body: JSON.stringify(buildEmail(order, config)),
    signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
  });
  const result = await response.json();
  if (!response.ok || typeof result?.id !== "string") {
    throw new Error(`Resend rejected order notification (${response.status}): ${result?.message ?? "missing email ID"}`);
  }
  return result.id;
}

export async function handleOrderNotification(
  request: Request, config: NotificationConfig, fetcher: typeof fetch = fetch,
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
  let order: Order;
  try {
    order = parseOrder(await request.json());
  } catch (error) {
    console.error("Invalid order notification webhook", { error });
    return new Response("Invalid order webhook", { status: 400 });
  }
  try {
    const emailId = await sendEmail(order, config, fetcher);
    console.info("Order notification accepted by Resend", { orderId: order.id, emailId });
    return Response.json({ emailId });
  } catch (error) {
    console.error("Order notification failed; check Resend configuration and resend this order webhook", { orderId: order.id, error });
    return new Response("Email notification failed", { status: 502 });
  }
}
