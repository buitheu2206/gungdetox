import { handleOrderNotification } from "./handler.ts";
import { EMAIL_TEMPLATE } from "./email-template.ts";

Deno.serve((request) => handleOrderNotification(request, {
  webhookSecret: Deno.env.get("ORDER_WEBHOOK_SECRET") ?? "",
  apiKey: Deno.env.get("RESEND_API_KEY") ?? "",
  from: Deno.env.get("ORDER_NOTIFICATION_FROM") ?? "",
  recipients: Deno.env.get("ORDER_NOTIFICATION_TO") ?? "",
  emailTemplate: EMAIL_TEMPLATE,
}));
