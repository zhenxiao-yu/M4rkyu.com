import "server-only";

import Stripe from "stripe";
import { env } from "@/lib/env";

// Lazily-constructed singleton Stripe client. Returns null when the
// secret key isn't configured so callers (the checkout route, the
// webhook) can degrade to a clean "not configured" response instead of
// throwing at module load. Server-only — never import from a client file.
let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!cached) {
    cached = new Stripe(env.STRIPE_SECRET_KEY, { typescript: true });
  }
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}
