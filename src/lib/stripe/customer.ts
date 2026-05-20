import "server-only";

import { getStripe } from "./server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// Returns a Stripe customer id for a signed-in user, creating + saving
// one on first checkout so Stripe can store and prefill their shipping
// address and payment methods on return visits. Best-effort: returns
// undefined when Stripe or the service-role client isn't configured, in
// which case checkout falls back to a guest email.
export async function getOrCreateStripeCustomer(
  userId: string,
  email?: string,
): Promise<string | undefined> {
  const stripe = getStripe();
  const admin = getAdminSupabaseClient();
  if (!stripe || !admin) return undefined;

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();
  const existing = (profile as { stripe_customer_id: string | null } | null)
    ?.stripe_customer_id;
  if (existing) return existing;

  try {
    const customer = await stripe.customers.create({
      ...(email ? { email } : {}),
      metadata: { userId },
    });
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", userId);
    return customer.id;
  } catch {
    return undefined;
  }
}
