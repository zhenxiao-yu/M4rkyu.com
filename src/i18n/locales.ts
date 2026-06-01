// Single source of truth for every supported locale.
//
// Add a language here, add its `messages/<code>.json`, and add the matching
// `Language.<code>` key to both message files — nothing else in the app
// hardcodes the locale list. `routing.ts`, the proxy matcher, the language
// switcher, and the command palette all derive from this.

/**
 * Ordered locale codes. Must stay a literal `as const` tuple so `next-intl`'s
 * `defineRouting` can infer the `Locale` union from it. First entry is treated
 * as the default by `routing.ts`.
 */
export const LOCALE_CODES = ["en", "zh"] as const;

export type Locale = (typeof LOCALE_CODES)[number];

export const DEFAULT_LOCALE: Locale = LOCALE_CODES[0];

export interface LocaleMeta {
  /** BCP-47 code used in the URL prefix and `<html lang>`. */
  code: Locale;
  /** Endonym shown in pickers (the language's own name). */
  native: string;
  /** Compact glyph for the toggle pill (kept short for the HUD). */
  short: string;
  /** Text direction; drives `<html dir>` when RTL locales are added. */
  dir: "ltr" | "rtl";
}

export const LOCALES: Record<Locale, LocaleMeta> = {
  en: { code: "en", native: "English", short: "EN", dir: "ltr" },
  zh: { code: "zh", native: "中文", short: "中文", dir: "ltr" },
  // fr: { code: "fr", native: "Français", short: "FR", dir: "ltr" },
  // es: { code: "es", native: "Español", short: "ES", dir: "ltr" },
};

export const LOCALE_LIST: readonly LocaleMeta[] = LOCALE_CODES.map(
  (code) => LOCALES[code],
);

/** Matches a leading locale prefix only at a segment boundary (`/en`, `/en/x`). */
const LOCALE_PREFIX_RE = new RegExp(`^/(?:${LOCALE_CODES.join("|")})(?=/|$)`);

/**
 * Strip the locale prefix from a pathname, returning a locale-agnostic path
 * that `next-intl`'s `Link`/`router` can re-prefix with any target locale.
 * Built from `LOCALE_CODES`, so it never goes stale when a language is added.
 */
export function stripLocale(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX_RE, "") || "/";
}

/** Next locale in rotation — used by the 2-locale toggle and palette. */
export function getNextLocale(current: Locale): Locale {
  const i = LOCALE_CODES.indexOf(current);
  return LOCALE_CODES[(i + 1) % LOCALE_CODES.length];
}
