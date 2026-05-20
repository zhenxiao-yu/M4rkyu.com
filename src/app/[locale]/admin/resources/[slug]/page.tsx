import { ArrowLeft, ExternalLink } from "lucide-react";
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
import { ResourceForm } from "@/components/admin/resources/resource-form";
import {
  deleteResourceAction,
  updateResourceAction,
} from "@/lib/resources/admin";
import {
  dbResourceRowToResource,
  getDbResourceBySlug,
} from "@/lib/resources/db";
import { DeleteButton } from "@/components/admin/delete-button";
import { buildResourceFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function EditResourcePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "AdminResources" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  const row = await getDbResourceBySlug(slug);
  if (!row) notFound();

  const resource = dbResourceRowToResource(row);
  const labels = await buildResourceFormLabels(locale);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={resource.name}
        description={resource.description || t("editResourceDescription")}
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6 flex items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm" className="-ml-3 h-auto px-3">
            <Link href="/admin/resources" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToResources")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a
              href={
                row.type === "tool"
                  ? `/${locale}/resources/${row.slug}`
                  : row.link
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink aria-hidden="true" className="size-3.5" />
              {tAdmin("list.view")}
            </a>
          </Button>
        </div>

        <ResourceForm
          action={updateResourceAction}
          resource={{ ...resource, id: row.id, sortOrder: row.sort_order }}
          labels={{ ...labels, submit: t("save") }}
          successMessage={tAdmin("saved")}
          hiddenFields={<input type="hidden" name="id" value={row.id} />}
          cancelHref={`/${locale}/admin/resources`}
        />

        <Card className="mt-8 max-w-2xl border-destructive/30 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              {t("dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={deleteResourceAction}>
              <input type="hidden" name="id" value={row.id} />
              <DeleteButton
                variant="outline"
                size="sm"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                confirmMessage={t("deleteResourceConfirm", {
                  name: resource.name,
                })}
              >
                {t("deleteResource")}
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
