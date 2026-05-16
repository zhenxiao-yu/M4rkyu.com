import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CookieConsentBanner } from "@/components/privacy/cookie-consent-banner";
import { ConsentAwareAnalytics } from "@/components/privacy/consent-aware-analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { CommandPaletteProvider } from "@/components/system/command-palette-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { routing, type Locale } from "@/i18n/routing";
import { getPosts } from "@/lib/blog/get-posts";
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

  // Slim payload — only fields the palette indexes. Cached fetcher,
  // shared with /logs and /logs/[slug] within the same render.
  const posts = await getPosts();
  const palettePosts = posts.slice(0, 20).map((post) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    tags: post.tags,
  }));

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd data={buildSiteJsonLd(activeLocale)} />
      <ThemeProvider>
        <TooltipProvider delayDuration={400} skipDelayDuration={150}>
          <CommandPaletteProvider posts={palettePosts}>
            {/*
             * `lang={locale}` lives on a `display: contents` wrapper so
             * the DOM exposes the active locale without altering layout.
             * This is what lets the `:lang(zh)` CJK guard in globals.css
             * fire on the /zh route (root <html> stays `lang="en"`),
             * which in turn lets the pixel layer use `font-pixel` on
             * translated strings (Phase 7 cleanup of Phase 3's NIT).
             */}
            <div lang={locale} className="contents">
              {children}
            </div>
            <CookieConsentBanner />
            <ConsentAwareAnalytics />
            {/* Sonner toaster mounts inside ThemeProvider so it tracks
             * the active data-theme. Any client island can fire
             * `toast.success(...)` from this point onward. */}
            <Toaster />
          </CommandPaletteProvider>
        </TooltipProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
