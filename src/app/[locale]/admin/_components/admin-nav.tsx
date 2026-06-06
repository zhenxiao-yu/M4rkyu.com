"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Gamepad2,
  Clapperboard,
  Images,
  BookMarked,
  StickyNote,
  ShoppingBag,
  UserCog,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

type Tab = {
  href: string;
  key:
    | "overview"
    | "projects"
    | "games"
    | "media"
    | "gallery"
    | "resources"
    | "notes"
    | "shop"
    | "profile"
    | "comments"
    | "users";
  icon: LucideIcon;
  /** Start of the moderation group — render a divider before it. */
  groupStart?: boolean;
};

// Content types first, then the moderation group (comments / users). Icons
// make the bar scannable at a glance; the divider keeps "manage what I publish"
// visually distinct from "manage who interacts."
const TABS: Tab[] = [
  { href: "/admin", key: "overview", icon: LayoutDashboard },
  { href: "/admin/projects", key: "projects", icon: FolderGit2 },
  { href: "/admin/games", key: "games", icon: Gamepad2 },
  { href: "/admin/media", key: "media", icon: Clapperboard },
  { href: "/admin/gallery", key: "gallery", icon: Images },
  { href: "/admin/resources", key: "resources", icon: BookMarked },
  { href: "/admin/notes", key: "notes", icon: StickyNote },
  { href: "/admin/shop", key: "shop", icon: ShoppingBag },
  { href: "/admin/profile", key: "profile", icon: UserCog },
  { href: "/admin/comments", key: "comments", icon: MessageSquare, groupStart: true },
  { href: "/admin/users", key: "users", icon: Users },
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
    <nav
      aria-label={t("navLabel")}
      className="mb-8 border-b border-border"
    >
      {/* Single non-wrapping row: overflow scrolls horizontally on narrow
        * viewports instead of stacking into three ragged rows. Scrollbar
        * hidden so it reads as a clean command bar; the row stays keyboard-
        * and swipe-scrollable. */}
      <ul
        className={cn(
          "flex items-center gap-1 overflow-x-auto pb-px",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {TABS.map((tab) => {
          const active =
            tab.href === "/admin"
              ? stripped === "/admin"
              : stripped.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li
              key={tab.href}
              className={cn(
                "shrink-0",
                tab.groupStart &&
                  "ml-1 border-l border-border/70 pl-2",
              )}
            >
              <Link
                href={tab.href}
                locale={locale}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium transition-colors sm:px-3",
                  FOCUS_RING_INSET,
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground/70 group-hover:text-foreground",
                  )}
                />
                {t(tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
