import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

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
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
    INQUIRY_TO_EMAIL: z.string().email("INQUIRY_TO_EMAIL must be a valid email"),
    INQUIRY_FROM_EMAIL: z
      .string()
      .email("INQUIRY_FROM_EMAIL must be a valid sender (e.g. inquiry@m4rkyu.com)"),
    TURNSTILE_SECRET_KEY: z.string().optional(),
    // Resend webhook signing secret. Required only by the webhook
    // route. Optional at module load so other server entry points
    // (server actions, build steps) don't fail when the webhook
    // isn't configured. The route itself returns 503 if missing.
    RESEND_WEBHOOK_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  },
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    INQUIRY_TO_EMAIL: process.env.INQUIRY_TO_EMAIL,
    INQUIRY_FROM_EMAIL: process.env.INQUIRY_FROM_EMAIL,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
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
