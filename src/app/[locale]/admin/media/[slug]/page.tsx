import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "../../_components/admin-nav";
import { MediaForm } from "@/components/admin/media/media-form";
import { deleteMediaAction, updateMediaAction } from "@/lib/media/admin";
import { dbMediaRowToItem, getDbMediaBySlug } from "@/lib/media/db";
import { DeleteButton } from "@/components/admin/delete-button";
import { buildMediaFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function EditMediaPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "AdminMedia" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  const row = await getDbMediaBySlug(slug);
  if (!row) notFound();

  const item = dbMediaRowToItem(row);
  const labels = await buildMediaFormLabels(locale);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={item.title}
        description={item.description || t("editMediaDescription")}
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
          action={updateMediaAction}
          item={{ ...item, id: row.id, sortOrder: row.sort_order }}
          labels={{ ...labels, submit: t("save") }}
          successMessage={tAdmin("saved")}
          hiddenFields={<input type="hidden" name="id" value={row.id} />}
          cancelHref={`/${locale}/admin/media`}
        />

        <Card className="mt-8 max-w-2xl border-destructive/30 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              {t("dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={deleteMediaAction}>
              <input type="hidden" name="id" value={row.id} />
              <DeleteButton
                variant="outline"
                size="sm"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                confirmMessage={t("deleteMediaConfirm", {
                  title: item.title,
                })}
              >
                {t("deleteMedia")}
              </DeleteButton>
              <p className="mt-2 text-[0.7rem] text-muted-foreground">
                {t("deleteWarning")}
              </p>
            </form>
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  );
}
