import "server-only";

import { getResendClient } from "@/lib/email/client";
import { env } from "@/lib/env";
import { formatPrice } from "./format";

interface OrderEmailLine {
  title: string;
  quantity: number;
  priceInCents: number;
}

// Best-effort order confirmation. No-ops cleanly when Resend isn't
// configured or there's no customer email — the order is already
// persisted by the time this runs, so a failed send must not throw.
export async function sendOrderConfirmation(args: {
  to: string | null;
  locale: "en" | "zh";
  items: OrderEmailLine[];
  amountTotal: number;
  currency: string;
}): Promise<void> {
  if (!args.to || !env.RESEND_API_KEY || !env.INQUIRY_FROM_EMAIL) return;

  const lines = args.items
    .map(
      (item) =>
        `${item.quantity}× ${item.title} — ${formatPrice(item.priceInCents * item.quantity, args.locale, args.currency)}`,
    )
    .join("\n");
  const total = formatPrice(args.amountTotal, args.locale, args.currency);

  const intro =
    args.locale === "zh" ? "感谢你的订单！" : "Thanks for your order!";
  const totalLabel = args.locale === "zh" ? "合计" : "Total";
  const subject =
    args.locale === "zh"
      ? "订单确认 · m4rkyu.com"
      : "Order confirmation · m4rkyu.com";

  await getResendClient().emails.send({
    from: env.INQUIRY_FROM_EMAIL,
    to: args.to,
    subject,
    text: `${intro}\n\n${lines}\n\n${totalLabel}: ${total}\n`,
  });
}
