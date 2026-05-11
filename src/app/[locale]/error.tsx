"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * Site-styled error boundary for the [locale] segment. Replaces the
 * default Next.js error UI so uncaught rendering errors still land
 * on a surface that looks like M4RKYU.SYS rather than the framework
 * skin.
 *
 * App Router requires error.tsx to be a client component — error
 * boundaries can't suspend on the server. The PageShell (server-only,
 * async) can't be reused here; this file inlines the cyber-grid +
 * vignette atmosphere so the fallback still reads as part of the
 * site.
 *
 * `reset` is wired into the retry CTA. `digest` (Next.js's
 * stable-hash error fingerprint, present in production) is surfaced
 * in a small mono chip so a visitor can quote it when reporting.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Error");

  useEffect(() => {
    // Production analytics could ship this — for now we just keep a
    // dev log so the underlying error surfaces in the browser
    // console with site context. removeConsole strips this in
    // production via next.config.ts.
    console.error("[M4RKYU.SYS] route error", error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="relative flex min-h-dvh flex-col overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cyber-grid opacity-25"
        aria-hidden="true"
      />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <section className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-24 sm:px-6 lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h1 className="mt-6 text-balance font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
            {t("subtitle")}
          </p>
          {error.digest ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/30 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span>{t("digestLabel")}</span>
              <span className="text-foreground">{error.digest}</span>
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={reset} type="button">
              {t("retry")}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/" locale={locale}>
                {t("home")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
