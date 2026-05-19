import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "../../_components/admin-nav";
import { createCollectionAction } from "@/lib/gallery/admin";
import { SubmitButton } from "@/components/admin/submit-button";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminGallery" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("newCollectionTitle")}
        description={t("newCollectionDescription")}
        decorativeWord="NEW"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3 h-auto px-3">
            <Link href="/admin/gallery" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToCollections")}
            </Link>
          </Button>
        </div>

        <Card className="max-w-2xl bg-card/80">
          <CardHeader>
            <CardTitle>{t("collectionForm")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCollectionAction} className="grid gap-4">
              <FormField label={t("titleLabel")} name="title" required />
              <FormField
                label={t("slugLabel")}
                name="slug"
                hint={t("slugHint")}
                required
                pattern="[a-z0-9-]+"
              />
              <FormField
                label={t("descriptionLabel")}
                name="description"
                multiline
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label={t("statusLabel")}
                  name="status"
                  options={[
                    { value: "placeholder", label: t("status.placeholder") },
                    { value: "draft", label: t("status.draft") },
                    { value: "ready", label: t("status.ready") },
                    { value: "coming-soon", label: t("status.comingSoon") },
                  ]}
                  defaultValue="placeholder"
                />
                <FormField
                  label={t("sortOrderLabel")}
                  name="sortOrder"
                  type="number"
                  defaultValue="0"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="featured"
                  className="size-4 rounded border-border accent-ring"
                />
                <span>{t("featured")}</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/gallery" locale={locale}>
                    {t("cancel")}
                  </Link>
                </Button>
                <SubmitButton size="sm">{t("create")}</SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  );
}

function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  multiline,
  hint,
  pattern,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  hint?: string;
  pattern?: string;
}) {
  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={4}
          required={required}
          className={inputClass}
        />
      ) : (
        <Input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          pattern={pattern}
          autoComplete="off"
        />
      )}
      {hint ? (
        <span className="text-[0.7rem] text-muted-foreground/70">{hint}</span>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
