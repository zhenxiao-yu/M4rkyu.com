import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING } from "@/lib/utils";

const STATES = ["ok", "expired", "invalid", "unavailable"] as const;
type State = (typeof STATES)[number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Newsletter" });
  // Transactional landing — keep it out of search.
  return { title: t("confirmedMetaTitle"), robots: { index: false } };
}

export default async function NewsletterConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { locale } = await params;
  const { state: rawState } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Newsletter" });

  const state: State = (STATES as readonly string[]).includes(rawState ?? "")
    ? (rawState as State)
    : "invalid";

  const copy: Record<State, { title: string; body: string }> = {
    ok: { title: t("confirmedOkTitle"), body: t("confirmedOkBody") },
    expired: {
      title: t("confirmedExpiredTitle"),
      body: t("confirmedExpiredBody"),
    },
    invalid: {
      title: t("confirmedInvalidTitle"),
      body: t("confirmedInvalidBody"),
    },
    unavailable: {
      title: t("confirmedUnavailableTitle"),
      body: t("confirmedUnavailableBody"),
    },
  };

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={copy[state].title}
        description={copy[state].body}
        decorativeWord={t("eyebrow")}
      />
      <PageSection>
        <Link
          href="/latest"
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground",
            FOCUS_RING,
          )}
        >
          {t("backToLatest")}
        </Link>
      </PageSection>
    </PageShell>
  );
}
