import type { ReactNode } from "react";
import type { AdminActionState } from "@/lib/admin/action-state";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, Row, Field, Select } from "@/components/admin/form-kit";
import { AiAssistButton } from "@/components/admin/ai-assist-button";
import {
  ImageDropzone,
  type DropzoneLabels,
} from "@/components/admin/image-dropzone";
import { SlugField } from "@/components/admin/slug-field";
import type { MediaItem } from "@/content/schemas";

// Form used by /admin/media/new and /admin/media/[slug]. Server
// component — the field body is server-rendered and handed to the
// client <AdminForm> shell, which wires the action through
// useActionState for inline error/success feedback.

interface Labels {
  required: string;
  basics: string;
  detail: string;
  titleLabel: string;
  slugLabel: string;
  slugHint: string;
  formatLabel: string;
  statusLabel: string;
  sortOrderLabel: string;
  descriptionLabel: string;
  durationLabel: string;
  durationHint: string;
  media: string;
  imageLabel: string;
  imageHint: string;
  imageReplaceHint: string;
  dropzone: DropzoneLabels;
  posterAltLabel: string;
  posterAltHint: string;
  currentImage: string;
  submit: string;
  cancel: string;
  format: {
    video: string;
    reel: string;
    process: string;
    poster: string;
  };
  status: {
    ready: string;
    draft: string;
    placeholder: string;
    comingSoon: string;
  };
}

export function MediaForm({
  action,
  item,
  labels,
  successMessage,
  hiddenFields,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  item?: MediaItem & { id?: string; sortOrder?: number };
  labels: Labels;
  successMessage: string;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const formatOptions = [
    { value: "video", label: labels.format.video },
    { value: "reel", label: labels.format.reel },
    { value: "process", label: labels.format.process },
    { value: "poster", label: labels.format.poster },
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
    format: item?.format ?? "video",
    status: item?.status ?? "draft",
    description: item?.description ?? "",
    duration: item?.duration ?? "",
    posterAlt: item?.poster?.alt ?? "",
    sortOrder: String(item?.sortOrder ?? 0),
  };
  const posterUrl = item?.poster?.src ?? null;

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
        <Row cols={3}>
          <Select
            label={labels.formatLabel}
            name="format"
            defaultValue={d.format}
            options={formatOptions}
          />
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
      </Section>

      <Section title={labels.detail}>
        <Field
          label={labels.descriptionLabel}
          name="description"
          defaultValue={d.description}
          multiline
          rows={4}
          required
          assist={
            <AiAssistButton
              task="shortPitch"
              target="description"
              sources={["title", "format"]}
            />
          }
        />
        <Field
          label={labels.durationLabel}
          name="duration"
          defaultValue={d.duration}
          hint={labels.durationHint}
        />
      </Section>

      <Section title={labels.media}>
        <ImageDropzone
          name="image"
          label={labels.imageLabel}
          hint={posterUrl ? labels.imageReplaceHint : labels.imageHint}
          labels={labels.dropzone}
          currentImageUrl={posterUrl}
        />
        <Field
          label={labels.posterAltLabel}
          name="posterAlt"
          defaultValue={d.posterAlt}
          hint={labels.posterAltHint}
        />
      </Section>
    </AdminForm>
  );
}
