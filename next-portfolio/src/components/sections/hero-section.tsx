import { ArrowRight, Code, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-cyber-grid opacity-45" aria-hidden="true" />
      <div className="noise-layer absolute inset-0" aria-hidden="true" />
      <div className="scanline-layer absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-muted-foreground">
              {t("eyebrow")}
            </p>
            <DraftBadge label="Prototype" />
          </div>
          <h1 className="mt-6 max-w-5xl text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.86] tracking-normal">
            {t("title")}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/projects" locale={locale}>
                {t("primaryCta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/portal" locale={locale}>
                {t("portalCta")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="https://github.com/zhenxiao-yu" target="_blank" rel="noopener noreferrer">
                <Code className="size-4" />
                GitHub
              </a>
            </Button>
            <Button size="lg" variant="ghost" disabled>
              <FileText className="size-4" />
              Resume TBD
            </Button>
          </div>
        </div>
        <div className="relative min-h-[28rem] overflow-hidden rounded-lg border bg-card/70 p-5 shadow-2xl">
          <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
          <div className="relative grid h-full min-h-[25rem] content-between">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>creative systems / draft</span>
              <span>2027</span>
            </div>
            <div className="my-14 grid gap-3">
              {["software", "games", "art", "interfaces"].map((item, index) => (
                <div key={item} className="grid grid-cols-[auto_1fr] items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                  <div className="h-12 border bg-background/70 px-4 py-3 text-xl uppercase tracking-[0.18em]">
                    {item}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground sm:grid-cols-4">
              {["SEO", "i18n", "themes", "a11y"].map((item) => (
                <div key={item} className="rounded-md border bg-background/50 px-3 py-2 text-center">
                  {item}
                </div>
              ))}
            </div>
            <p className="max-w-sm font-mono text-xs leading-6 text-muted-foreground">
              Draft visual architecture: replace placeholder media and final project copy while
              preserving the black-and-white archive system.
            </p>
            <div className="mt-4">
              <ContentPendingLabel label="FINAL MEDIA TBD" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
