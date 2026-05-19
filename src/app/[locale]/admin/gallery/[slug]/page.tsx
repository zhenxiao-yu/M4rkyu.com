import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getDbCollectionBySlug,
  getDbGalleryItems,
  storageUrlFor,
} from "@/lib/gallery/db";
import {
  createItemAction,
  deleteCollectionAction,
  deleteItemAction,
  updateCollectionAction,
} from "@/lib/gallery/admin";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminNav } from "../../_components/admin-nav";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "AdminGallery" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  const collection = await getDbCollectionBySlug(slug);
  if (!collection) notFound();

  const allItems = await getDbGalleryItems();
  const items = allItems.filter((item) => item.collectionId === collection.id);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={collection.title}
        description={collection.description || t("noDescription")}
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

        <div className="grid gap-8 xl:grid-cols-[1fr_22rem]">
          {/* Items grid */}
          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {t("itemsHeading", { count: items.length })}
              </h2>
            </div>

            {items.length === 0 ? (
              <Card className="bg-card/80">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  {t("noItems")}
                </CardContent>
              </Card>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => {
                  const src = storageUrlFor(item.storagePath);
                  return (
                    <li key={item.id}>
                      <Card className="bg-card/80">
                        <CardHeader className="pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[0.6rem]">
                              {item.status}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-[0.6rem]">
                              {item.type}
                            </Badge>
                            {item.featured ? (
                              <Badge variant="success" className="font-mono text-[0.6rem]">
                                {t("featured")}
                              </Badge>
                            ) : null}
                          </div>
                          <CardTitle className="mt-1 text-sm">
                            {item.title}
                          </CardTitle>
                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/80">
                            /{item.slug}
                          </p>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                          {src ? (
                            <div className="relative aspect-4/5 overflow-hidden rounded-md border border-border/60">
                              <Image
                                src={src}
                                alt={item.alt || item.title}
                                fill
                                sizes="(min-width: 640px) 280px, 100vw"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="grid aspect-4/5 place-items-center rounded-md border border-dashed border-border/60 bg-muted/30 text-center text-xs text-muted-foreground">
                              {t("noImage")}
                            </div>
                          )}
                          <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                            {item.caption || t("noCaption")}
                          </p>
                          <form action={deleteItemAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <DeleteButton
                              variant="outline"
                              size="sm"
                              className="w-full text-destructive hover:text-destructive"
                              confirmMessage={t("deleteItemConfirm", {
                                title: item.title,
                              })}
                            >
                              {t("deleteItem")}
                            </DeleteButton>
                          </form>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Right rail: new item form + collection actions */}
          <aside className="grid gap-4">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">{t("newItem")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  action={createItemAction}
                  encType="multipart/form-data"
                  className="grid gap-3"
                >
                  <input
                    type="hidden"
                    name="collectionId"
                    value={collection.id}
                  />
                  <Field label={t("titleLabel")} name="title" required />
                  <Field
                    label={t("slugLabel")}
                    name="slug"
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <FieldFile label={t("imageLabel")} name="image" />
                  <Field
                    label={t("captionLabel")}
                    name="caption"
                    multiline
                  />
                  <Field
                    label={t("altLabel")}
                    name="alt"
                    hint={t("altHint")}
                  />
                  <div className="grid gap-2 md:grid-cols-2">
                    <Select
                      label={t("typeLabel")}
                      name="type"
                      defaultValue="image"
                      options={[
                        { value: "image", label: t("itemType.image") },
                        { value: "contact-sheet", label: t("itemType.contactSheet") },
                        { value: "process", label: t("itemType.process") },
                      ]}
                    />
                    <Select
                      label={t("aspectLabel")}
                      name="aspect"
                      defaultValue="4/5"
                      options={["1/1", "4/5", "3/4", "2/3", "16/9", "21/9"].map(
                        (v) => ({ value: v, label: v }),
                      )}
                    />
                  </div>
                  <Select
                    label={t("statusLabel")}
                    name="status"
                    defaultValue="ready"
                    options={[
                      { value: "ready", label: t("status.ready") },
                      { value: "draft", label: t("status.draft") },
                      { value: "placeholder", label: t("status.placeholder") },
                      { value: "coming-soon", label: t("status.comingSoon") },
                    ]}
                  />
                  <SubmitButton
                    size="sm"
                    className="mt-1"
                    pendingLabel={t("uploading")}
                  >
                    <ImagePlus className="size-4" aria-hidden="true" />
                    {t("addItem")}
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">{t("collectionForm")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateCollectionAction} className="grid gap-3">
                  <input type="hidden" name="id" value={collection.id} />
                  <Field
                    label={t("titleLabel")}
                    name="title"
                    defaultValue={collection.title}
                    required
                  />
                  <Field
                    label={t("slugLabel")}
                    name="slug"
                    defaultValue={collection.slug}
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <Field
                    label={t("descriptionLabel")}
                    name="description"
                    defaultValue={collection.description}
                    multiline
                  />
                  <Select
                    label={t("statusLabel")}
                    name="status"
                    defaultValue={collection.status}
                    options={[
                      { value: "placeholder", label: t("status.placeholder") },
                      { value: "draft", label: t("status.draft") },
                      { value: "ready", label: t("status.ready") },
                      { value: "coming-soon", label: t("status.comingSoon") },
                    ]}
                  />
                  <Field
                    label={t("sortOrderLabel")}
                    name="sortOrder"
                    type="number"
                    defaultValue={String(collection.sortOrder)}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={collection.featured}
                      className="size-4 rounded border-border accent-ring"
                    />
                    <span>{t("featured")}</span>
                  </label>
                  <SubmitButton
                    size="sm"
                    variant="outline"
                    pendingLabel={t("saving")}
                  >
                    {t("save")}
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive">
                  {t("dangerZone")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form action={deleteCollectionAction}>
                  <input type="hidden" name="id" value={collection.id} />
                  <DeleteButton
                    variant="outline"
                    size="sm"
                    className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    confirmMessage={t("deleteCollectionConfirm", {
                      title: collection.title,
                    })}
                  >
                    {t("deleteCollection")}
                  </DeleteButton>
                  <p className="mt-2 text-[0.7rem] text-muted-foreground">
                    {t("deleteWarning")}
                  </p>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      </PageSection>
    </PageShell>
  );
}

function Field({
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
          rows={3}
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

function FieldFile({ label, name }: { label: string; name: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        type="file"
        name={name}
        accept="image/*"
        className="w-full rounded-md border border-dashed border-border bg-background/40 px-3 py-2 text-xs"
      />
    </label>
  );
}

function Select({
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
