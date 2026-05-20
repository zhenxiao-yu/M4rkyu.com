import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/shop/clear-cart-on-mount";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tShop = await getTranslations({ locale, namespace: "Shop" });
  return {
    title: tShop("successTitle"),
    robots: { index: false },
  };
}

export default async function ShopSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id: sessionId } = await searchParams;
  const tShop = await getTranslations({ locale, namespace: "Shop" });

  return (
    <PageShell locale={locale}>
      <ClearCartOnMount />
      <PageHero eyebrow={tShop("successEyebrow")} title={tShop("successTitle")} />
      <PageSection width="narrow">
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          {tShop("successDescription")}
        </p>

        {sessionId ? (
          <div className="mt-6 inline-flex max-w-full flex-col gap-1 rounded-md border border-border bg-muted/30 px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {tShop("successOrderRef")}
            </span>
            <span className="truncate font-mono text-sm text-foreground">{sessionId}</span>
          </div>
        ) : null}

        <div className="mt-8">
          <Button asChild>
            <Link href="/shop">{tShop("successContinue")}</Link>
          </Button>
        </div>
      </PageSection>
    </PageShell>
  );
}
