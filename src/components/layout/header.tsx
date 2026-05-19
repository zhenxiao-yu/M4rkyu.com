import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { SoundSettingsButton } from "@/components/system/sound-settings-button";
import { QrCodeButton } from "@/components/system/qr-code-button";
import { CommandPaletteTrigger } from "@/components/system/command-palette-trigger";
import { CommandPaletteIconTrigger } from "@/components/system/command-palette-icon-trigger";
import { NotificationBell } from "@/components/system/notification-bell";
import { UserMenu } from "@/components/auth/user-menu";
import { SignInSheet } from "@/components/auth/sign-in-sheet";
import { getPosts } from "@/lib/blog/get-posts";
import { MobileNav } from "./mobile-nav";
import { HeaderDock } from "./header-dock";
import { DesktopNav } from "./desktop-nav";
import { buildNavStructure, type NavLabels } from "./nav-structure";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });

  const labels: NavLabels = {
    projects: t("projects"),
    work: t("work"),
    games: t("games"),
    gallery: t("gallery"),
    archive: t("archive"),
    shop: t("shop"),
    logs: t("logs"),
    blogs: t("blogs"),
    notes: t("notes"),
    resources: t("resources"),
    about: t("about"),
    contact: t("contact"),
  };

  const structure = buildNavStructure(labels);

  return (
    // Sticky full-width system bar. `pointer-events-none` keeps only
    // the glass dock interactive while the surrounding header gutter
    // remains click-through over immersive first sections.
    <header className="pointer-events-none sticky top-0 z-40 w-full">
      <HeaderDock>
        <Link
          href="/"
          locale={locale}
          className="group inline-flex min-w-0 shrink-0 items-center gap-2.5 rounded-md px-1.5 py-1 font-mono text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:justify-self-start"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-foreground text-background text-xs font-bold tracking-tight shadow-sm transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:group-hover:scale-105 motion-safe:group-active:scale-100">
            M4
          </span>
          <span className="hidden min-w-0 flex-col leading-none sm:flex">
            <span className="truncate tracking-wide">M4RK_YU</span>
            <span className="mt-1 text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
              portfolio
            </span>
          </span>
        </Link>

        <DesktopNav
          locale={locale}
          groups={structure.groups}
          flatLinks={structure.flatLinks}
          ariaLabel={t("navigateLabel")}
        />

        {/* Desktop right rail (lg+) — positioned at the end of its
         * grid column so the centered DesktopNav stays viewport-anchored. */}
        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex lg:justify-self-end">
          <CommandPaletteTrigger />
          {/* Tinted utility cluster — bell, lang, theme, single sound
           * settings button (replaces the old SoundToggle + MusicToggle
           * pair; opens the media-player dialog), QR. */}
          <div className="flex items-center gap-0.5 rounded-xl border-border/60 bg-muted/30 p-0.5">
            <LazyNotificationBell locale={locale} />
            <LanguageSwitcher />
            <ThemeSwitcher />
            <SoundSettingsButton />
            <QrCodeButton url="https://m4rkyu.com" />
          </div>
          {/* UserMenu renders Sign-in trigger (guest) or account link
           * (signed-in). Hides entirely when Supabase env vars are
           * unset so previews stay clean. */}
          <Suspense fallback={<SignInSheet />}>
            <UserMenu locale={locale} />
          </Suspense>
        </div>

        {/* Compact rail (<lg): the language and theme controls stay
         * directly reachable; secondary sound/music/QR controls move
         * into the sheet to keep the dock readable on 360px screens. */}
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
          <CommandPaletteIconTrigger />
          <LazyNotificationBell locale={locale} />
          <Suspense fallback={<SignInSheet />}>
            <UserMenu locale={locale} />
          </Suspense>
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

function LazyNotificationBell({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={<NotificationBell posts={[]} locale={locale} />}>
      <NotificationBellFeed locale={locale} />
    </Suspense>
  );
}

async function NotificationBellFeed({ locale }: { locale: Locale }) {
  const posts = await getPosts();
  const notificationFeed = posts.slice(0, 8).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    canonicalUrl: post.canonicalUrl,
  }));

  return <NotificationBell posts={notificationFeed} locale={locale} />;
}
