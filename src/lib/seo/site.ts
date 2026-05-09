/**
 * Single source of truth for the production canonical host.
 *
 * Used by `metadataBase` (root layout), `sitemap.ts`, and
 * `robots.ts` so canonicals, hreflang alternates, and the sitemap
 * always agree.
 *
 * NOTE on apex vs `www.`: as of 2026-05-09, both `m4rkyu.com` and
 * `www.m4rkyu.com` serve content directly on Vercel (no host-level
 * redirect). Google may pick either as canonical; we declare `www.`
 * here to match historical OG / canonical signals already indexed.
 * Resolving the duplicate-content concern is a Vercel domain-config
 * task tracked separately — flip this constant to apex once the
 * `www.` → apex 308 redirect is wired up at the platform level.
 */
export const SITE_URL = "https://www.m4rkyu.com";
