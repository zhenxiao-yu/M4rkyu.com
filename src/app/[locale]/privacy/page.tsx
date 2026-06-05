import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { cn, FOCUS_RING } from "@/lib/utils";

export const dynamic = "force-static";
export const revalidate = 3600;

// Fixed reading order. Each id maps to PrivacyPolicy.s.<id>.{h,p} in the
// message catalogs (parity-checked en/zh). "contact" appends the live
// mailto from `profile` so the address never drifts from the source.
const SECTIONS = [
  "controller",
  "collect",
  "forms",
  "analytics",
  "ai",
  "accounts",
  "processors",
  "retention",
  "rights",
  "children",
  "changes",
  "contact",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("privacyTitle"),
    description: tMeta("privacyDescription"),
    alternates: buildAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "PrivacyPolicy" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("privacyTitle")}
        description={tMeta("privacyDescription")}
        decorativeWord="PRIVACY"
      />
      <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("updated")} · {t("updatedDate")}
          </p>
          <p className="mt-5 text-base leading-7 text-foreground/85">
            {t("intro")}
          </p>

          <div className="mt-10 flex flex-col gap-9">
            {SECTIONS.map((id, index) => (
              <section key={id} aria-labelledby={`privacy-${id}`}>
                <h2
                  id={`privacy-${id}`}
                  className="flex items-baseline gap-3 font-heading text-xl font-semibold tracking-tight"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs tabular-nums text-ring/70"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {t(`s.${id}.h`)}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {t(`s.${id}.p`)}
                </p>
                {id === "contact" ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className={cn(
                      "mt-3 inline-flex items-center gap-2 rounded-md font-mono text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:text-ring",
                      FOCUS_RING,
                    )}
                  >
                    <Mail aria-hidden="true" className="size-3.5" />
                    {profile.email}
                  </a>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </PageSection>
    </PageShell>
  );
}
