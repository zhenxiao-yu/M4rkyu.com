import type { Metadata } from "next";
import {
  ArrowUpRight,
  Boxes,
  Code2,
  Database,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { cn, FOCUS_RING } from "@/lib/utils";

export const dynamic = "force-static";
export const revalidate = 3600;

const STACK = [
  {
    icon: Code2,
    key: "app",
    tags: ["Next.js 16", "React 19", "TypeScript"],
  },
  {
    icon: Sparkles,
    key: "interface",
    tags: ["Tailwind 4", "Radix", "Motion"],
  },
  {
    icon: Database,
    key: "data",
    tags: ["Supabase", "Zod", "next-intl"],
  },
  {
    icon: Boxes,
    key: "commerce",
    tags: ["Stripe", "Resend", "Vercel"],
  },
  {
    icon: ShieldCheck,
    key: "quality",
    tags: ["ESLint", "Playwright", "Storybook"],
  },
  {
    icon: Globe2,
    key: "delivery",
    tags: ["ISR", "OG images", "Sitemap"],
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("colophonTitle"),
    description: tMeta("colophonDescription"),
    alternates: buildAlternates(locale, "/colophon"),
  };
}

export default async function ColophonPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Colophon" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("colophonTitle")}
        description={tMeta("colophonDescription")}
        decorativeWord="COLOPHON"
      />
      <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STACK.map((item, index) => {
            const Icon = item.icon;
            return (
              <BlurFade key={item.key} delay={Math.min(index, 5) * 0.06}>
                <article className="glass-surface glass-interactive relative h-full overflow-hidden rounded-lg p-5">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cyber-grid opacity-[0.12]"
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-md border border-ring/40 bg-background/70 text-ring">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-mono text-xs tabular-nums tracking-[0.2em] text-muted-foreground/40"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className="mt-5 font-heading text-xl font-semibold tracking-tight">
                      {t(`${item.key}.title`)}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t(`${item.key}.body`)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="font-mono text-[0.58rem] uppercase tracking-[0.16em]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </article>
              </BlurFade>
            );
          })}
        </div>

        <BlurFade delay={0.1}>
          <div className="glass-surface mt-8 grid gap-3 rounded-lg p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ring">
                {t("auditEyebrow")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
                {t("auditTitle")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t("auditBody")}
              </p>
            </div>
            <Link
              href="/changelog"
              locale={locale}
              className={cn(
                "group inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-ring/60",
                FOCUS_RING,
              )}
            >
              {t("changelogCta")}
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </BlurFade>
      </PageSection>
    </PageShell>
  );
}
