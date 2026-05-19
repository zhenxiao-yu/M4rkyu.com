"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const TABS = [
  { href: "/account", key: "overview" as const },
  { href: "/account/saved", key: "saved" as const },
  { href: "/account/comments", key: "comments" as const },
  { href: "/account/settings", key: "settings" as const },
];

export function AccountNav({ locale }: { locale: Locale }) {
  const t = useTranslations("Account");
  const pathname = usePathname();
  // Strip the locale prefix so we can compare against the locale-less
  // tab href. `usePathname` returns the full pathname including the
  // locale segment under next-intl's "always" prefix mode. Plain
  // string trimming avoids the regex-meta-character footgun that
  // `new RegExp(\`^/${locale}\`)` would have if a locale token ever
  // contained `.` / `+` / `(` etc.
  const localePrefix = `/${locale}`;
  const stripped = pathname.startsWith(localePrefix)
    ? pathname.slice(localePrefix.length) || "/"
    : pathname || "/";

  return (
    <nav aria-label={t("navLabel")} className="mb-8 border-b border-border">
      <ul className="flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const active =
            tab.href === "/account"
              ? stripped === "/account"
              : stripped.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                locale={locale}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-t-md border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors",
                  "hover:text-foreground",
                  FOCUS_RING_INSET,
                  active && "border-foreground text-foreground",
                )}
              >
                {t(tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
