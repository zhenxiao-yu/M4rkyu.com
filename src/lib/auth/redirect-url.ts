import { env } from "@/lib/env";

/**
 * Compute the public origin to use for OAuth redirect URLs.
 *
 * Resolution order:
 *   1. Provided `requestOrigin` — keeps localhost, production, and
 *      preview deployments on the origin the user actually opened.
 *   2. `NEXT_PUBLIC_SITE_URL` — author-provided fallback.
 *   3. `VERCEL_URL` — populated by Vercel on preview / prod deploys.
 *   4. `http://localhost:3000` — last-resort default.
 *
 * Always returns a value without a trailing slash.
 */
export function resolveSiteOrigin(requestOrigin?: string | null): string {
  if (requestOrigin) return stripTrailingSlash(requestOrigin);

  const fromEnv = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) return `https://${stripTrailingSlash(vercelHost)}`;

  return "http://localhost:3000";
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Validate that a `next` redirect target is a same-origin pathname.
 *
 * Defends against open-redirect attacks via crafted `?next=` values.
 * Rejects:
 *   - protocol-relative URLs (`//evil.example`)
 *   - backslash-prefixed paths (`/\evil.example`) — Chrome normalises
 *     these to `/` then literal characters which is harmless, but a
 *     stricter check costs nothing and stops weirder parsers
 *   - anything not starting with `/`
 *
 * Returns the input when safe, or the provided `fallback` otherwise.
 * Callers may layer additional locale-prefix validation on top.
 */
export function sanitizeNextPath(value: string, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.startsWith("/\\")) return fallback;
  return value;
}
