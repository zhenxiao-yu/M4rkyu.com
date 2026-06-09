import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { ThemePicker } from "@/components/theme/theme-picker";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { SoundSettingsButton } from "@/components/system/sound-settings-button";
import { CommandPaletteTrigger } from "@/components/system/command-palette-trigger";
import { NotificationBell } from "@/components/system/notification-bell";
import { UserMenu } from "@/components/auth/user-menu";
import { SignInSheet } from "@/components/auth/sign-in-sheet";
import { getNotificationFeed } from "@/lib/notifications/feed";
import { AudioNavBar } from "@/components/ui/magic/audio-visualizer";
import { MobileNav } from "./mobile-nav";
import { HeaderDock } from "./header-dock";
import { HeaderStatusStrip } from "./header-status-strip";
import { DesktopNav } from "./desktop-nav";
import { buildNavStructure, type NavLabels } from "./nav-structure";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });

  const labels: NavLabels = {
    build: t("build"),
    work: t("work"),
    workDescription: t("workDescription"),
    games: t("games"),
    gamesDescription: t("gamesDescription"),
    gallery: t("gallery"),
    photos: t("photos"),
    archiveDescription: t("archiveDescription"),
    shop: t("shop"),
    shopDescription: t("shopDescription"),
    writing: t("writing"),
    blogs: t("blogs"),
    blogsDescription: t("blogsDescription"),
    notes: t("notes"),
    notesDescription: t("notesDescription"),
    resources: t("resources"),
    tools: t("tools"),
    toolsDescription: t("toolsDescription"),
    links: t("links"),
    linksDescription: t("linksDescription"),
    about: t("about"),
    contact: t("contact"),
  };

  const structure = buildNavStructure(labels);

  return (
    // Sticky full-width system bar. `pointer-events-none` keeps only
    // the glass dock interactive while the surrounding header gutter
    // remains click-through over immersive first sections.
    <header className="pointer-events-none sticky top-0 z-40 w-full">
      <HeaderStatusStrip locale={locale} />
      <HeaderDock>
        {/* Sleek, mirror-symmetric spectrum hugging the dock's lower
         * edge. Silent until music plays; reduced-motion safe. */}
        <AudioNavBar />
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
        <div className="ml-auto hidden shrink-0 items-center gap-1.5 lg:flex lg:justify-self-end">
          <CommandPaletteTrigger />
          {/* Tinted utility cluster — bell, lang, theme. The QR / share
           * affordance now lives on the contact page. Audio control lives
           * in the HUD status strip on lg+, so no audio button here. */}
          <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-0.5">
            <LazyNotificationBell locale={locale} />
            <LanguageSwitcher />
            <ThemePicker />
            <ThemeSwitcher />
          </div>
          {/* UserMenu renders Sign-in trigger (guest) or account link
           * (signed-in). Hides entirely when Supabase env vars are
           * unset so previews stay clean. */}
          <Suspense fallback={<SignInSheet />}>
            <UserMenu locale={locale} />
          </Suspense>
        </div>

        {/* Compact rail (<lg): pared down to the two glanceable controls
         * — unread notifications and the instant theme toggle — plus the
         * menu trigger. Search, language, sound, QR and account all live
         * inside the full-screen sheet, so the dock stays uncramped and
         * legible on 360px screens instead of clamping the desktop rail. */}
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
          <LazyNotificationBell locale={locale} />
          <ThemeSwitcher />
          <SoundSettingsButton />
          <MobileNav
            locale={locale}
            groups={structure.groups}
            flatLinks={structure.flatLinks}
            account={
              <Suspense fallback={<SignInSheet />}>
                <UserMenu locale={locale} />
              </Suspense>
            }
          />
        </div>
      </HeaderDock>
    </header>
  );
}

function LazyNotificationBell({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={<NotificationBell items={[]} locale={locale} />}>
      <NotificationBellFeed locale={locale} />
    </Suspense>
  );
}

async function NotificationBellFeed({ locale }: { locale: Locale }) {
  const notificationFeed = await getNotificationFeed(locale);
  return <NotificationBell items={notificationFeed} locale={locale} />;
}
