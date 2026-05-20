import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";

// Validates a promotion code against Stripe so the cart can show the
// discount before checkout. The code is re-validated server-side at
// checkout too — this endpoint is only for UI feedback.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code || code.length > 64) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  try {
    const promos = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });
    const promo = promos.data[0];
    if (!promo) {
      return NextResponse.json({ valid: false });
    }
    const coupon = (
      promo as {
        coupon?: {
          percent_off?: number | null;
          amount_off?: number | null;
          currency?: string | null;
        };
      }
    ).coupon;
    return NextResponse.json({
      valid: true,
      code: promo.code,
      percentOff: coupon?.percent_off ?? null,
      amountOff: coupon?.amount_off ?? null,
      currency: coupon?.currency ?? null,
    });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
