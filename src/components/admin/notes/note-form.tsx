import type { ReactNode } from "react";
import type { AdminActionState } from "@/lib/admin/action-state";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, Row, Field, Select } from "@/components/admin/form-kit";
import { TagField } from "@/components/admin/tag-field";
import { SlugField } from "@/components/admin/slug-field";
import { tiersToText } from "@/lib/notes/tiers";
import type { Note } from "@/content/schemas";

// Form used by /admin/notes/new and /admin/notes/[slug]. Server
// component — the field body is server-rendered and handed to the client
// <AdminForm> shell. Every kind shares one form; the kind-specific
// sections (link, rating, tiers) are always shown with hints, and the
// server action stores only the fields relevant to the chosen kind.

interface Labels {
  basics: string;
  content: string;
  link: string;
  review: string;
  tierlist: string;
  kindLabel: string;
  titleLabel: string;
  titleHint: string;
  slugLabel: string;
  slugHint: string;
  statusLabel: string;
  publishedAtLabel: string;
  sortOrderLabel: string;
  sortOrderHint: string;
  bodyLabel: string;
  bodyHint: string;
  tagsLabel: string;
  tagsHint: string;
  linkUrlLabel: string;
  linkUrlHint: string;
  linkLabelLabel: string;
  linkLabelHint: string;
  ratingLabel: string;
  ratingHint: string;
  tiersLabel: string;
  tiersHint: string;
  submit: string;
  cancel: string;
  kind: {
    update: string;
    repost: string;
    note: string;
    review: string;
    tierlist: string;
  };
  status: {
    ready: string;
    draft: string;
    placeholder: string;
    comingSoon: string;
  };
  ratingOption: { none: string };
}

export function NoteForm({
  action,
  note,
  labels,
  successMessage,
  hiddenFields,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  note?: Note & { id?: string; sortOrder?: number };
  labels: Labels;
  successMessage: string;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const kindOptions = [
    { value: "update", label: labels.kind.update },
    { value: "repost", label: labels.kind.repost },
    { value: "note", label: labels.kind.note },
    { value: "review", label: labels.kind.review },
    { value: "tierlist", label: labels.kind.tierlist },
  ];

  const statusOptions = [
    { value: "ready", label: labels.status.ready },
    { value: "draft", label: labels.status.draft },
    { value: "placeholder", label: labels.status.placeholder },
    { value: "coming-soon", label: labels.status.comingSoon },
  ];

  const ratingOptions = [
    { value: "0", label: labels.ratingOption.none },
    { value: "1", label: "★" },
    { value: "2", label: "★★" },
    { value: "3", label: "★★★" },
    { value: "4", label: "★★★★" },
    { value: "5", label: "★★★★★" },
  ];

  const d = {
    kind: note?.kind ?? "note",
    title: note?.title ?? "",
    slug: note?.slug ?? "",
    status: note?.status ?? "draft",
    // timestamptz → date input value
    publishedAt: (note?.publishedAt ?? "").slice(0, 10),
    sortOrder: String(note?.sortOrder ?? 0),
    body: note?.body ?? "",
    tags: (note?.tags ?? []).join("\n"),
    linkUrl: note?.link?.url ?? "",
    linkLabel: note?.link?.label ?? "",
    rating: String(note?.rating ?? 0),
    tiers: tiersToText(note?.tiers ?? []),
  };

  return (
    <AdminForm
      action={action}
      draftKey={`notes:${note?.slug ?? "new"}`}
      submitLabel={labels.submit}
      cancelLabel={labels.cancel}
      cancelHref={cancelHref}
      successMessage={successMessage}
      hiddenFields={hiddenFields}
    >
      <Section title={labels.basics}>
        <Row cols={2}>
          <Select
            label={labels.kindLabel}
            name="kind"
            defaultValue={d.kind}
            options={kindOptions}
          />
          <Field
            label={labels.titleLabel}
            name="title"
            defaultValue={d.title}
            hint={labels.titleHint}
          />
        </Row>
        <SlugField
          name="slug"
          sourceName="title"
          label={labels.slugLabel}
          hint={labels.slugHint}
          defaultValue={d.slug}
        />
        <Row cols={3}>
          <Select
            label={labels.statusLabel}
            name="status"
            defaultValue={d.status}
            options={statusOptions}
          />
          <Field
            label={labels.publishedAtLabel}
            name="publishedAt"
            type="date"
            defaultValue={d.publishedAt}
          />
          <Field
            label={labels.sortOrderLabel}
            name="sortOrder"
            type="number"
            defaultValue={d.sortOrder}
            hint={labels.sortOrderHint}
          />
        </Row>
      </Section>

      <Section title={labels.content}>
        <Field
          label={labels.bodyLabel}
          name="body"
          defaultValue={d.body}
          multiline
          rows={8}
          hint={labels.bodyHint}
        />
        <TagField
          label={labels.tagsLabel}
          name="tags"
          defaultValue={d.tags}
          hint={labels.tagsHint}
        />
      </Section>

      <Section title={labels.link}>
        <Row cols={2}>
          <Field
            label={labels.linkUrlLabel}
            name="linkUrl"
            type="url"
            defaultValue={d.linkUrl}
            hint={labels.linkUrlHint}
          />
          <Field
            label={labels.linkLabelLabel}
            name="linkLabel"
            defaultValue={d.linkLabel}
            hint={labels.linkLabelHint}
          />
        </Row>
      </Section>

      <Section title={labels.review}>
        <Select
          label={labels.ratingLabel}
          name="rating"
          defaultValue={d.rating}
          options={ratingOptions}
        />
        <p className="text-[0.7rem] text-muted-foreground/70">
          {labels.ratingHint}
        </p>
      </Section>

      <Section title={labels.tierlist}>
        <Field
          label={labels.tiersLabel}
          name="tiers"
          defaultValue={d.tiers}
          multiline
          rows={5}
          hint={labels.tiersHint}
        />
      </Section>
    </AdminForm>
  );
}
