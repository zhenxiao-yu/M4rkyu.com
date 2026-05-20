import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { cartSchema, resolveCart } from "@/lib/shop/cart-shared";
import { getShopProducts } from "@/content/shop";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Mints a Stripe Checkout Session. The trust boundary: the client posts
// only { slug, quantity }; every price + product fact is resolved here
// from the catalog, so totals can't be tampered with. Shipping is
// collected only when the cart contains a physical item.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Inline string literals are checked against Stripe's allowed-country
// union at the call site below (a separately-typed const is not).
const SHIPPING_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "AU",
  "DE",
  "FR",
  "NL",
  "JP",
  "CN",
  "HK",
  "SG",
] as const;

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = cartSchema.safeParse(body?.cart);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_cart" }, { status: 400 });
  }
  const locale = body?.locale === "zh" ? "zh" : "en";

  const resolved = resolveCart(parsed.data.items, getShopProducts());
  if (resolved.lines.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  // Best-effort link to the signed-in account (for order history).
  let userId: string | undefined;
  let email: string | undefined;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        userId = data.user.id;
        email = data.user.email ?? undefined;
      }
    } catch {
      // Not signed in / Supabase unavailable — checkout still works.
    }
  }

  const origin = request.nextUrl.origin;
  const lineItems = resolved.lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: "usd",
      unit_amount: line.product.priceInCents,
      product_data: {
        name: line.product.title,
        description: line.product.summary,
        metadata: { slug: line.product.slug, kind: line.product.kind },
      },
    },
  }));

  const itemsMeta = resolved.lines
    .map((line) => `${line.product.slug}:${line.quantity}`)
    .join(",")
    .slice(0, 480);

  // Saved customer (address/payment reuse) for signed-in buyers.
  const customerId = userId
    ? await getOrCreateStripeCustomer(userId, email)
    : undefined;

  // Re-validate any applied promo code server-side — never trust the
  // client. When valid we apply it directly; otherwise we still let the
  // buyer enter a code on Stripe's hosted page (allow_promotion_codes).
  let promotionCodeId: string | undefined;
  const promoCode = parsed.data.promo?.code?.trim();
  if (promoCode) {
    try {
      const promos = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      });
      promotionCodeId = promos.data[0]?.id;
    } catch {
      // Ignore — fall back to manual entry at checkout.
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/${locale}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/shop/cart`,
      ...(customerId
        ? {
            customer: customerId,
            customer_update: {
              address: "auto",
              name: "auto",
              ...(resolved.hasPhysical ? { shipping: "auto" } : {}),
            },
          }
        : email
          ? { customer_email: email }
          : {}),
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : { allow_promotion_codes: true }),
      metadata: {
        locale,
        items: itemsMeta,
        ...(userId ? { userId } : {}),
      },
      ...(resolved.hasPhysical
        ? {
            shipping_address_collection: {
              allowed_countries: [...SHIPPING_COUNTRIES],
            },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: 800, currency: "usd" },
                  display_name: "Standard shipping",
                  delivery_estimate: {
                    minimum: { unit: "business_day", value: 5 },
                    maximum: { unit: "business_day", value: 14 },
                  },
                },
              },
            ],
          }
        : {}),
    });

    if (!session.url) {
      return NextResponse.json({ error: "no_session_url" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
