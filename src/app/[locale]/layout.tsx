import { Suspense } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CookieConsentBanner } from "@/components/privacy/cookie-consent-banner";
import { ConsentAwareAnalytics } from "@/components/privacy/consent-aware-analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { CommandPaletteProvider } from "@/components/system/command-palette-provider";
import { NavigationProgress } from "@/components/system/navigation-progress";
import { CursorTrail } from "@/components/ui/magic/cursor-trail";
import { AudioAutoplayConsent } from "@/components/system/audio-autoplay-consent";
import { AudioPlayerProvider } from "@/lib/audio/audio-player-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LocalSavesMigration } from "@/components/saves/local-saves-migration";
import { AuthStatusToast } from "@/components/auth/auth-status-toast";
import { routing, type Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { buildSiteJsonLd } from "@/lib/seo/structured-data";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const activeLocale = locale as Locale;
  const messages = await getMessages({ locale: activeLocale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd data={buildSiteJsonLd(activeLocale)} />
      <ThemeProvider>
        <TooltipProvider delayDuration={400} skipDelayDuration={150}>
          <AudioPlayerProvider>
            <CommandPaletteProvider>
            {/*
             * `lang={locale}` lives on a `display: contents` wrapper so
             * the DOM exposes the active locale without altering layout.
             * This is what lets the `:lang(zh)` CJK guard in globals.css
             * fire on the /zh route (root <html> stays `lang="en"`),
             * which in turn lets the pixel layer use `font-pixel` on
             * translated strings (Phase 7 cleanup of Phase 3's NIT).
             */}
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <div lang={locale} className="contents">
              {children}
            </div>
            {/* First-visit ambient-audio prompt. Persists the choice and
             * starts playback on the consenting gesture (browser autoplay
             * policy forbids sound before a user gesture). */}
            <AudioAutoplayConsent />
            <CursorTrail />
            <CookieConsentBanner />
            <ConsentAwareAnalytics />
            <Suspense fallback={null}>
              <SignedInSavesMigration />
            </Suspense>
            {/* Surfaces ?authError / ?accountDeleted URL params as
             * Sonner toasts on first paint, then strips them from the
             * URL so a refresh doesn't replay. Wrapped in Suspense
             * because the underlying useSearchParams() opts the
             * client side into URL-driven rendering. */}
            <Suspense fallback={null}>
              <AuthStatusToast />
            </Suspense>
            {/* Sonner toaster mounts inside ThemeProvider so it tracks
             * the active data-theme. Any client island can fire
             * `toast.success(...)` from this point onward. */}
            <Toaster />
          </CommandPaletteProvider>
          </AudioPlayerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

async function SignedInSavesMigration() {
  const currentUser = await getCurrentUser();

  return <LocalSavesMigration signedIn={Boolean(currentUser)} />;
}
