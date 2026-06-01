import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALE_CODES } from "./locales";

export const routing = defineRouting({
  locales: LOCALE_CODES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});

// Re-export so existing `import { Locale } from "@/i18n/routing"` keeps working.
export type { Locale } from "./locales";
