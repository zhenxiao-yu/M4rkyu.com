import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { SoundToggle } from "@/components/system/sound-toggle";
import { MusicToggle } from "@/components/system/music-toggle";
import { QrCodeButton } from "@/components/system/qr-code-button";
import { CommandPaletteTrigger } from "@/components/system/command-palette-trigger";
import { CommandPaletteIconTrigger } from "@/components/system/command-palette-icon-trigger";
import { NotificationBell } from "@/components/system/notification-bell";
import { PillNav } from "@/components/ui/magic/pill-nav";
import { getPosts } from "@/lib/blog/get-posts";
import { MobileNav } from "./mobile-nav";
import { HeaderDock } from "./header-dock";
import { buildNavStructure, type NavLabels } from "./nav-structure";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const tCategories = await getTranslations({
    locale,
    namespace: "Categories",
  });

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

  // Re-uses the React.cache()-wrapped fetcher the /logs page calls, so
  // the upstream dev.to request is deduped within a single render.
  const posts = await getPosts();
  const notificationFeed = posts.slice(0, 8).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    canonicalUrl: post.canonicalUrl,
  }));

  // Flat nav for the GooeyNav. Sub-categories (work categories,
  // archive collections, etc.) are reachable from each landing page
  // and the command palette — keeping the header flat matches the
  // wodniack reference and lets the goo pill be the focal point.
  const navItems = [
    { label: t("work"), href: "/work" },
    { label: t("archive"), href: "/archive" },
    { label: t("logs"), href: "/logs" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ];

  return (
    // Sticky header. Outer wrapper reserves `var(--dock-h)` (60px) of
    // flow space; page-shell pulls `<main>` up by that much so each
    // page's first section renders behind the glass dock.
    // `pointer-events-none` keeps the gutter click-through; the dock
    // itself re-enables clicks.
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <HeaderDock>
        <Link
          href="/"
          locale={locale}
          className="group inline-flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl px-1.5 py-1 font-mono text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-foreground text-background text-xs font-bold tracking-tight shadow-sm transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:group-hover:scale-105 motion-safe:group-active:scale-100">
            M4
          </span>
          <span className="hidden truncate tracking-wide sm:inline">
            M4RKYU.SYS
          </span>
        </Link>

        {/* Center: PillNav (lg+ only — mobile uses the sheet via
         * MobileNav). The pill snaps to the active route on first
         * paint via pathname-driven activeIndex; clicking another
         * item slides the pill across via motion's shared layout
         * transition. */}
        <div className="hidden flex-1 justify-center lg:flex">
          <PillNav items={navItems} />
        </div>

        {/* Desktop right rail (lg+) */}
        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <CommandPaletteTrigger />
          {/* Tinted utility cluster — bell, lang, theme, sound, music, QR. */}
          <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-0.5">
            <NotificationBell posts={notificationFeed} locale={locale} />
            <LanguageSwitcher />
            <ThemeSwitcher />
            <SoundToggle />
            <MusicToggle />
            <QrCodeButton url="https://m4rkyu.com" />
          </div>
        </div>

        {/* Compact rail (<lg): the language and theme controls stay
         * directly reachable; secondary sound/music/QR controls move
         * into the sheet to keep the dock readable on 360px screens. */}
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
          <CommandPaletteIconTrigger />
          <NotificationBell posts={notificationFeed} locale={locale} />
          <LanguageSwitcher />
          <ThemeSwitcher />
          <MobileNav
            locale={locale}
            groups={structure.groups}
            flatLinks={structure.flatLinks}
          />
        </div>
      </HeaderDock>
    </header>
  );
}
