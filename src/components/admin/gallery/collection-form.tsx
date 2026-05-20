import type { ReactNode } from "react";
import type { AdminActionState } from "@/lib/admin/action-state";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, Row, Field, Select, Checkbox } from "@/components/admin/form-kit";
import { SlugField } from "@/components/admin/slug-field";
import type { DbCollection } from "@/lib/gallery/db";

// Form used by /admin/gallery/new and the collection edit panel on
// /admin/gallery/[slug]. Server component — the field body is
// server-rendered and handed to the client <AdminForm> shell, which
// wires the action through useActionState for inline error/success
// feedback. Cover image upload is out of scope this pass — the cover
// is derived from item images, so only the cover alt text is editable
// here.

interface Labels {
  basics: string;
  titleLabel: string;
  slugLabel: string;
  slugHint: string;
  descriptionLabel: string;
  statusLabel: string;
  sortOrderLabel: string;
  featuredLabel: string;
  coverAltLabel: string;
  coverAltHint: string;
  submit: string;
  cancel: string;
  status: {
    ready: string;
    draft: string;
    placeholder: string;
    comingSoon: string;
  };
}

export function CollectionForm({
  action,
  collection,
  labels,
  successMessage,
  hiddenFields,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  collection?: DbCollection;
  labels: Labels;
  successMessage: string;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const statusOptions = [
    { value: "ready", label: labels.status.ready },
    { value: "draft", label: labels.status.draft },
    { value: "placeholder", label: labels.status.placeholder },
    { value: "coming-soon", label: labels.status.comingSoon },
  ];

  const d = {
    title: collection?.title ?? "",
    slug: collection?.slug ?? "",
    description: collection?.description ?? "",
    status: collection?.status ?? "draft",
    sortOrder: String(collection?.sortOrder ?? 0),
    featured: collection?.featured ?? false,
    coverAlt: collection?.coverAlt ?? "",
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
          label={labels.descriptionLabel}
          name="description"
          defaultValue={d.description}
          multiline
          rows={3}
        />
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
        <Checkbox label={labels.featuredLabel} name="featured" defaultChecked={d.featured} />
        <Field
          label={labels.coverAltLabel}
          name="coverAlt"
          defaultValue={d.coverAlt}
          hint={labels.coverAltHint}
        />
      </Section>
    </AdminForm>
  );
}
