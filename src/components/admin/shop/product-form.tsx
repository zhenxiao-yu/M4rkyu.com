import Image from "next/image";
import type { ReactNode } from "react";
import type { AdminActionState } from "@/lib/admin/action-state";
import { AdminForm } from "@/components/admin/admin-form";
import {
  Section,
  Row,
  Field,
  Select,
  Checkbox,
  FileField,
} from "@/components/admin/form-kit";
import { SlugField } from "@/components/admin/slug-field";
import type { Product } from "@/content/shop";

// Form used by /admin/shop/new and /admin/shop/[slug]. Server component
// — the field body is server-rendered and handed to the client
// <AdminForm> shell, which wires the action through useActionState for
// inline error/success feedback. Cover image upload is supported on
// both create and edit (re-uploading replaces the current image).

interface Labels {
  basics: string;
  pricing: string;
  detail: string;
  media: string;
  titleLabel: string;
  slugLabel: string;
  slugHint: string;
  summaryLabel: string;
  summaryHint: string;
  descriptionLabel: string;
  categoryLabel: string;
  categoryHint: string;
  kindLabel: string;
  priceLabel: string;
  priceHint: string;
  statusLabel: string;
  sortOrderLabel: string;
  tagsLabel: string;
  tagsHint: string;
  digitalNoteLabel: string;
  digitalNoteHint: string;
  imageLabel: string;
  imageHint: string;
  imageReplaceHint: string;
  imageAltLabel: string;
  imageAltHint: string;
  currentImage: string;
  featuredLabel: string;
  inStockLabel: string;
  submit: string;
  cancel: string;
  kind: { physical: string; digital: string };
  status: { ready: string; draft: string; placeholder: string; comingSoon: string };
}

export function ProductForm({
  action,
  item,
  imageUrl,
  labels,
  successMessage,
  hiddenFields,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  item?: Product & { id?: string; sortOrder?: number };
  imageUrl?: string | null;
  labels: Labels;
  successMessage: string;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const kindOptions = [
    { value: "physical", label: labels.kind.physical },
    { value: "digital", label: labels.kind.digital },
  ];

  const statusOptions = [
    { value: "ready", label: labels.status.ready },
    { value: "draft", label: labels.status.draft },
    { value: "placeholder", label: labels.status.placeholder },
    { value: "coming-soon", label: labels.status.comingSoon },
  ];

  const d = {
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    summary: item?.summary ?? "",
    description: item?.description ?? "",
    category: item?.category ?? "",
    kind: item?.kind ?? "physical",
    priceInCents: String(item?.priceInCents ?? 0),
    status: item?.status ?? "placeholder",
    tags: (item?.tags ?? []).join("\n"),
    digitalNote: item?.digitalNote ?? "",
    imageAlt: item?.image?.alt ?? "",
    featured: item?.featured ?? false,
    inStock: item?.inStock ?? true,
    sortOrder: String(item?.sortOrder ?? 0),
  };

  return (
    <AdminForm
      action={action}
      submitLabel={labels.submit}
      cancelLabel={labels.cancel}
      cancelHref={cancelHref}
      successMessage={successMessage}
      hiddenFields={hiddenFields}
    >
      <Section title={labels.basics}>
        <Row cols={2}>
          <Field label={labels.titleLabel} name="title" defaultValue={d.title} required />
          <SlugField
            name="slug"
            sourceName="title"
            label={labels.slugLabel}
            hint={labels.slugHint}
            defaultValue={d.slug}
          />
        </Row>
        <Field
          label={labels.summaryLabel}
          name="summary"
          defaultValue={d.summary}
          hint={labels.summaryHint}
          required
        />
        <Field
          label={labels.descriptionLabel}
          name="description"
          defaultValue={d.description}
          multiline
          rows={5}
        />
      </Section>

      <Section title={labels.pricing}>
        <Row cols={3}>
          <Select
            label={labels.kindLabel}
            name="kind"
            defaultValue={d.kind}
            options={kindOptions}
          />
          <Field
            label={labels.priceLabel}
            name="priceInCents"
            type="number"
            defaultValue={d.priceInCents}
            hint={labels.priceHint}
            required
          />
          <Field
            label={labels.categoryLabel}
            name="category"
            defaultValue={d.category}
            hint={labels.categoryHint}
            required
          />
        </Row>
        <Row cols={2}>
          <Checkbox label={labels.featuredLabel} name="featured" defaultChecked={d.featured} />
          <Checkbox label={labels.inStockLabel} name="inStock" defaultChecked={d.inStock} />
        </Row>
      </Section>

      <Section title={labels.media}>
        {imageUrl ? (
          <div className="grid gap-1.5">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {labels.currentImage}
            </span>
            <div className="relative aspect-16/10 max-w-xs overflow-hidden rounded-md border border-border/60">
              <Image
                src={imageUrl}
                alt={d.imageAlt || d.title}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}
        <FileField
          label={labels.imageLabel}
          name="image"
          accept="image/*"
          hint={imageUrl ? labels.imageReplaceHint : labels.imageHint}
        />
        <Field
          label={labels.imageAltLabel}
          name="imageAlt"
          defaultValue={d.imageAlt}
          hint={labels.imageAltHint}
        />
      </Section>

      <Section title={labels.detail}>
        <Row cols={2}>
          <Select
            label={labels.statusLabel}
            name="status"
            defaultValue={d.status}
            options={statusOptions}
          />
          <Field
            label={labels.sortOrderLabel}
            name="sortOrder"
            type="number"
            defaultValue={d.sortOrder}
          />
        </Row>
        <Field
          label={labels.tagsLabel}
          name="tags"
          defaultValue={d.tags}
          multiline
          rows={3}
          hint={labels.tagsHint}
        />
        <Field
          label={labels.digitalNoteLabel}
          name="digitalNote"
          defaultValue={d.digitalNote}
          hint={labels.digitalNoteHint}
        />
      </Section>
    </AdminForm>
  );
}
