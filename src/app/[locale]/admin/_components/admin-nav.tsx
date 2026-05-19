"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const TABS = [
  { href: "/admin", key: "overview" as const },
  { href: "/admin/comments", key: "comments" as const },
  { href: "/admin/users", key: "users" as const },
];

export function AdminNav({ locale }: { locale: Locale }) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  // Plain string trim to avoid regex-meta-character footguns when
  // the locale token grows past `en` / `zh`. See sibling AccountNav
  // for the same reasoning.
  const localePrefix = `/${locale}`;
  const stripped = pathname.startsWith(localePrefix)
    ? pathname.slice(localePrefix.length) || "/"
    : pathname || "/";

  return (
    <nav aria-label={t("navLabel")} className="mb-8 border-b border-border">
      <ul className="flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const active =
            tab.href === "/admin"
              ? stripped === "/admin"
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
