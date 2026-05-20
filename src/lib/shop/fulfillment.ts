import "server-only";

import type Stripe from "stripe";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { getShopProducts } from "@/content/shop";
import { resolveCart, type CartItem } from "@/lib/shop/cart-shared";
import { sendOrderConfirmation } from "./order-email";

// Persist a completed Checkout Session as an order, then fire the
// confirmation email. Called only from the verified Stripe webhook.
// Idempotent: upsert on stripe_session_id so webhook retries don't
// duplicate. Requires the service-role client; no-ops if unavailable.
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const admin = getAdminSupabaseClient();
  if (!admin) return;

  const meta = session.metadata ?? {};
  const items: CartItem[] = (meta.items ?? "")
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [slug, qty] = pair.split(":");
      return { slug: slug ?? "", quantity: Number(qty) || 1 };
    })
    .filter((item) => item.slug.length > 0);

  const resolved = resolveCart(items, getShopProducts());
  const snapshot = resolved.lines.map((line) => ({
    slug: line.product.slug,
    title: line.product.title,
    quantity: line.quantity,
    priceInCents: line.product.priceInCents,
    kind: line.product.kind,
  }));

  const email = session.customer_details?.email ?? null;
  const shipping = session.customer_details
    ? {
        name: session.customer_details.name ?? null,
        email,
        address: session.customer_details.address ?? null,
      }
    : null;
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const { error } = await admin.from("orders").upsert(
    {
      stripe_session_id: session.id,
      stripe_payment_intent: paymentIntent,
      email,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "paid",
      items: snapshot,
      shipping,
      user_id: meta.userId || null,
    },
    { onConflict: "stripe_session_id" },
  );
  if (error) return;

  try {
    await sendOrderConfirmation({
      to: email,
      locale: meta.locale === "zh" ? "zh" : "en",
      items: snapshot,
      amountTotal: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
    });
  } catch {
    // Confirmation email is best-effort; the order is already saved.
  }
}
