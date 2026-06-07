"use client";

import type { ReactNode } from "react";
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
  Search,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

type NavItem = {
  href: string;
  key: string;
  icon: LucideIcon;
  /** Start of the moderation group — divider before it. */
  groupStart?: boolean;
};

const NAV: NavItem[] = [
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

/**
 * Dedicated admin chrome. Replaces the public PageShell across the /admin
 * subtree: a sticky left rail on desktop, a sticky top bar + horizontal nav
 * strip on mobile, and a calm, content-first main column. The ⌘K palette
 * (mounted in the layout) is raised via the `admin:command` event.
 */
export function AdminShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const localePrefix = `/${locale}`;
  const stripped = pathname.startsWith(localePrefix)
    ? pathname.slice(localePrefix.length) || "/"
    : pathname || "/";
  const isActive = (href: string) =>
    href === "/admin" ? stripped === "/admin" : stripped.startsWith(href);
  const openCommand = () =>
    window.dispatchEvent(new CustomEvent("admin:command"));

  const navList = (orientation: "rail" | "strip") => (
    <ul
      className={cn(
        orientation === "rail"
          ? "grid gap-0.5"
          : "flex items-center gap-1 overflow-x-auto pb-px [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {NAV.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <li
            key={item.href}
            className={cn(
              orientation === "strip" && "shrink-0",
              orientation === "rail" &&
                item.groupStart &&
                "mt-2 border-t border-border/60 pt-2",
              orientation === "strip" &&
                item.groupStart &&
                "ml-1 border-l border-border/70 pl-2",
            )}
          >
            <Link
              href={item.href}
              locale={locale}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group inline-flex items-center gap-2.5 rounded-md text-sm font-medium transition-colors",
                orientation === "rail" ? "w-full px-3 py-2" : "h-9 px-2.5",
                FOCUS_RING_INSET,
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground/70 group-hover:text-foreground",
                )}
              />
              {t(item.key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const brand = (
    <Link
      href="/admin"
      locale={locale}
      className={cn(
        "flex items-baseline gap-1.5 rounded-md px-1",
        FOCUS_RING_INSET,
      )}
    >
      <span className="text-sm font-semibold tracking-tight text-foreground">
        M4RKYU
      </span>
      <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
        ops
      </span>
    </Link>
  );

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-3 border-r border-border bg-card/30 px-3 py-4 lg:flex">
        <div className="flex items-center justify-between gap-2">
          {brand}
          <ThemeSwitcher />
        </div>
        <button
          type="button"
          onClick={openCommand}
          aria-label={t("palette.open")}
          className={cn(
            "inline-flex h-9 w-full items-center gap-2 rounded-md border border-border px-2.5 text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground",
            FOCUS_RING_INSET,
          )}
        >
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <span className="text-sm font-medium">{t("palette.open")}</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.6rem] text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <nav
          aria-label={t("navLabel")}
          className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1"
        >
          {navList("rail")}
        </nav>
        <Link
          href="/"
          locale={locale}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
            FOCUS_RING_INSET,
          )}
        >
          <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          {t("backToSite")}
        </Link>
      </aside>

      {/* Mobile top bar + nav strip */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70 lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-2">
          {brand}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCommand}
              aria-label={t("palette.open")}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground",
                FOCUS_RING_INSET,
              )}
            >
              <Search aria-hidden="true" className="size-4" />
            </button>
            <ThemeSwitcher />
          </div>
        </div>
        <nav aria-label={t("navLabel")} className="px-3 pb-1.5">
          {navList("strip")}
        </nav>
      </header>

      <main className="min-w-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
