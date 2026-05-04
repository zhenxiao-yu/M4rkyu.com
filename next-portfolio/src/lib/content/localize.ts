import type { Locale } from "@/i18n/routing";

export type Localized<T> = T & {
  translations?: Partial<Record<Locale, Partial<T>>>;
};

export function localize<T extends Record<string, unknown>>(
  item: Localized<T>,
  locale: Locale,
): T {
  const translation = item.translations?.[locale] ?? {};
  return { ...item, ...translation } as T;
}
