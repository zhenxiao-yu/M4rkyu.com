import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const requiredInProduction = (schema: z.ZodString) =>
  process.env.NODE_ENV === "production" ? schema : schema.optional();

/**
 * Typed environment variables. Validated at module load — a missing
 * required key fails the build instead of producing a silent 500 the
 * first time a server action runs in production.
 *
 * - `server` keys are only accessible in server contexts.
 * - `client` keys must be prefixed `NEXT_PUBLIC_` and are bundled.
 * - `runtimeEnv` is the bridge to `process.env`; Next inlines public
 *   keys at build time, so they must be listed explicitly here.
 *
 * Turnstile keys are optional: when unset, the verification helper
 * short-circuits to `{ ok: true }` so local dev works without a
 * Cloudflare account. Production deploys should set both.
 */
export const env = createEnv({
  server: {
    RESEND_API_KEY: requiredInProduction(
      z.string().min(1, "RESEND_API_KEY is required"),
    ),
    INQUIRY_TO_EMAIL: requiredInProduction(
      z.string().email("INQUIRY_TO_EMAIL must be a valid email"),
    ),
    INQUIRY_FROM_EMAIL: requiredInProduction(
      z
        .string()
        .email("INQUIRY_FROM_EMAIL must be a valid sender (e.g. inquiry@m4rkyu.com)"),
    ),
    TURNSTILE_SECRET_KEY: z.string().optional(),
    // Resend webhook signing secret. Required only by the webhook
    // route. Optional at module load so other server entry points
    // (server actions, build steps) don't fail when the webhook
    // isn't configured. The route itself returns 503 if missing.
    RESEND_WEBHOOK_SECRET: z.string().optional(),
    // Supabase service-role key. Optional. Bypasses RLS — only set
    // when a specific server-only admin job justifies it. Current
    // code paths do NOT require it; admin actions run via RLS as the
    // signed-in admin user. Never imported from a `"use client"` file.
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    // Steam stats integration for the /about dashboard. Both optional —
    // the card degrades to an empty state when unset. Mint the API key
    // at https://steamcommunity.com/dev/apikey. STEAM_ID is the 17-digit
    // SteamID64 (resolve via steamid.io). Profile + game details must
    // be set to Public in Steam privacy settings for the API to return
    // playtime data.
    STEAM_API_KEY: z.string().optional(),
    STEAM_ID: z.string().optional(),
    // Stripe (shop / payments). All optional so builds + preview deploys
    // pass without a Stripe account; `isStripeConfigured()` gates the
    // checkout route and the webhook returns 503 when its secret is
    // unset. Secret key is server-only and must never reach the client
    // bundle. Mint keys at https://dashboard.stripe.com/apikeys.
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    // Vercel AI Gateway key for the /api/search semantic search. Optional:
    // on Vercel, OIDC authenticates the gateway without it; the search route
    // returns 503 (graceful) when neither is present. Mint at
    // vercel.com → AI Gateway → API Keys.
    AI_GATEWAY_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    // Stripe publishable key — safe to expose; optional. Only needed if
    // a future embedded Payment Element is added (hosted Checkout uses
    // the server-minted session URL and doesn't require it).
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    // Supabase public config. Optional so lint / typecheck / preview
    // builds pass without the keys; runtime helpers in
    // `src/lib/supabase/*` short-circuit when unset and the auth UI
    // hides itself gracefully. See `isSupabaseConfigured()`.
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: z
      .enum(["true", "false"])
      .optional(),
    NEXT_PUBLIC_AUTH_GITHUB_ENABLED: z
      .enum(["true", "false"])
      .optional(),
    NEXT_PUBLIC_AUTH_DISCORD_ENABLED: z
      .enum(["true", "false"])
      .optional(),
    // Public site origin. Used to compute OAuth redirect URLs server
    // side. Optional — when unset, the request's own origin (or
    // VERCEL_URL on Vercel) is used as a fallback.
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    INQUIRY_TO_EMAIL: process.env.INQUIRY_TO_EMAIL,
    INQUIRY_FROM_EMAIL: process.env.INQUIRY_FROM_EMAIL,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STEAM_API_KEY: process.env.STEAM_API_KEY,
    STEAM_ID: process.env.STEAM_ID,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED:
      process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED,
    NEXT_PUBLIC_AUTH_GITHUB_ENABLED:
      process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED,
    NEXT_PUBLIC_AUTH_DISCORD_ENABLED:
      process.env.NEXT_PUBLIC_AUTH_DISCORD_ENABLED,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  // `next lint` and Storybook import this module without Resend keys
  // present. `skipValidation` lets those non-runtime contexts pass; the
  // real validation still runs in `next build` and `next dev`.
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" ||
    process.env.npm_lifecycle_event === "lint" ||
    process.env.npm_lifecycle_event === "typecheck",
  emptyStringAsUndefined: true,
});
