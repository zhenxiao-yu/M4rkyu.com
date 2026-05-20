import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "../../_components/admin-nav";
import { MediaForm } from "@/components/admin/media/media-form";
import { createMediaAction } from "@/lib/media/admin";
import { buildMediaFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

export default async function NewMediaPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminMedia" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });
  const labels = await buildMediaFormLabels(locale);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("newMediaTitle")}
        description={t("newMediaDescription")}
        decorativeWord="NEW"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3 h-auto px-3">
            <Link href="/admin/media" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToMedia")}
            </Link>
          </Button>
        </div>

        <MediaForm
          action={createMediaAction}
          labels={{ ...labels, submit: t("create") }}
          cancelHref={`/${locale}/admin/media`}
        />
      </PageSection>
    </PageShell>
  );
}
