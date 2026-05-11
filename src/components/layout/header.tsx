import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { SoundToggle } from "@/components/system/sound-toggle";
import { CommandPaletteTrigger } from "@/components/system/command-palette-trigger";
import { CommandPaletteIconTrigger } from "@/components/system/command-palette-icon-trigger";
import { NotificationBell } from "@/components/system/notification-bell";
import { getPosts } from "@/lib/blog/get-posts";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { buildNavStructure, type NavLabels } from "./nav-structure";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const tCategories = await getTranslations({ locale, namespace: "Categories" });

  const labels: NavLabels = {
    work: t("work"),
    archive: t("archive"),
    logs: t("logs"),
    allWork: t("allWork"),
    visualArchive: t("visualArchive"),
    writing: t("writing"),
    games: t("games"),
    media: t("media"),
    resources: t("resources"),
    about: t("about"),
    contact: t("contact"),
    categoryWebApp: tCategories("web-app"),
    categoryAiTool: tCategories("ai-tool"),
    categoryExperiment: tCategories("experiment"),
  };

  const structure = buildNavStructure(labels);

  // Re-uses the React.cache()-wrapped fetcher the /logs page calls,
  // so the upstream dev.to request is deduped within a single render
  // and amortised across requests via Next's fetch cache.
  const posts = await getPosts();
  const notificationFeed = posts.slice(0, 8).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    canonicalUrl: post.canonicalUrl,
  }));

  return (
    // Sticky header. The outer wrapper reserves `var(--dock-h)` (60px)
    // of flow space; page-shell pulls `<main>` up by the same amount
    // so each page's hero atmospheric layer (cyber-grid / noise /
    // scanline) extends behind the glass dock instead of leaving a
    // body-coloured bar above it. `--dock-h` lives on `:root` in
    // globals.css so both header and main read the same value — change
    // it in one place when the dock height changes.
    // `pointer-events-none` keeps the gutter click-through; the dock
    // itself re-enables clicks.
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="pointer-events-auto mx-auto flex h-12 w-full max-w-7xl items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-2 shadow-lg shadow-black/5 backdrop-blur-2xl sm:gap-3 sm:px-3 dark:shadow-black/20">
        <Link
          href="/"
          locale={locale}
          className="group inline-flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl px-1.5 py-1 font-mono text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-foreground text-background text-xs font-bold tracking-tight shadow-sm transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:scale-105 group-active:scale-100">
            M4
          </span>
          {/* Wordmark hides on the smallest screens so the dock can
            * absorb wider non-Latin labels (zh nav items) without
            * overflow. Wraps in `truncate` so any future locale that
            * lengthens the brand string can't blow the row. */}
          <span className="hidden truncate tracking-wide sm:inline">
            M4RKYU.SYS
          </span>
        </Link>

        <DesktopNav
          locale={locale}
          groups={structure.groups}
          flatLinks={structure.flatLinks}
          ariaLabel="Main navigation"
        />

        {/* Desktop right rail (lg+): full Cmd-K pill is its own
          * tile; the four icon controls cluster inside a tinted
          * sub-pill so they read as one bento module. */}
        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <CommandPaletteTrigger />
          <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-0.5">
            <NotificationBell posts={notificationFeed} locale={locale} />
            <LanguageSwitcher />
            <ThemeSwitcher />
            <SoundToggle />
          </div>
        </div>

        {/* Compact rail (<lg): Cmd-K icon + bell + theme + menu.
          * Bell stays at this tier so visitors on phones still see
          * unread counts; the sheet inside MobileNav owns lang and
          * sound to keep the dock under five touch targets. */}
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
          <CommandPaletteIconTrigger />
          <NotificationBell posts={notificationFeed} locale={locale} />
          <ThemeSwitcher />
          <MobileNav locale={locale} groups={structure.groups} flatLinks={structure.flatLinks} />
        </div>
      </div>
    </header>
  );
}
