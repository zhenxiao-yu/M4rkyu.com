import type { ReactNode } from "react";
import type { AdminActionState } from "@/lib/admin/action-state";
import { AdminForm } from "@/components/admin/admin-form";
import {
  Section,
  Row,
  Field,
  Select,
  Checkbox,
} from "@/components/admin/form-kit";
import {
  ImageDropzone,
  type DropzoneLabels,
} from "@/components/admin/image-dropzone";
import { SlugField } from "@/components/admin/slug-field";
import type { DbItem } from "@/lib/gallery/db";

// Form used to add an item (create) or edit an item. Server component
// handing its body to the client <AdminForm> shell. The image dropzone
// is shown in both modes: required on create, optional on edit (a new
// file replaces the current image; leaving it empty keeps the existing
// one). Natural width/height are captured client-side and persisted.

interface Labels {
  basics: string;
  detail: string;
  titleLabel: string;
  slugLabel: string;
  slugHint: string;
  imageLabel: string;
  imageHint: string;
  imageReplaceHint: string;
  dropzone: DropzoneLabels;
  captionLabel: string;
  altLabel: string;
  altHint: string;
  typeLabel: string;
  aspectLabel: string;
  statusLabel: string;
  sortOrderLabel: string;
  locationLabel: string;
  capturedAtLabel: string;
  capturedAtHint: string;
  featuredLabel: string;
  pinnedLabel: string;
  submit: string;
  cancel: string;
  status: {
    ready: string;
    draft: string;
    placeholder: string;
    comingSoon: string;
  };
  itemType: {
    image: string;
    contactSheet: string;
    process: string;
  };
}

export function ItemForm({
  action,
  item,
  collectionId,
  showImage,
  currentImageUrl,
  labels,
  successMessage,
  hiddenFields,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  item?: DbItem;
  collectionId: string;
  // True in create mode: the image is required. In edit mode this is
  // false and `currentImageUrl` supplies the preview to replace.
  showImage: boolean;
  currentImageUrl?: string | null;
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

  const typeOptions = [
    { value: "image", label: labels.itemType.image },
    { value: "contact-sheet", label: labels.itemType.contactSheet },
    { value: "process", label: labels.itemType.process },
  ];

  const aspectOptions = ["1/1", "4/5", "3/4", "2/3", "16/9", "21/9"].map(
    (v) => ({ value: v, label: v }),
  );

  const d = {
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    caption: item?.caption ?? "",
    alt: item?.alt ?? "",
    type: item?.type ?? "image",
    aspect: item?.aspect ?? "4/5",
    status: item?.status ?? "draft",
    sortOrder: String(item?.sortOrder ?? 0),
    location: item?.location ?? "",
    capturedAt: item?.capturedAt ?? "",
    featured: item?.featured ?? false,
    pinned: item?.pinned ?? false,
  };

  return (
    <AdminForm
      action={action}
      draftKey={`gallery-item:${collectionId}:${item?.slug ?? "new"}`}
      submitLabel={labels.submit}
      cancelLabel={labels.cancel}
      cancelHref={cancelHref}
      successMessage={successMessage}
      hiddenFields={
        <>
          <input type="hidden" name="collectionId" value={collectionId} />
          {hiddenFields}
        </>
      }
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
        <ImageDropzone
          name="image"
          label={labels.imageLabel}
          hint={showImage ? labels.imageHint : labels.imageReplaceHint}
          labels={labels.dropzone}
          currentImageUrl={currentImageUrl}
          required={showImage}
          optimize
          allowedTypes={[
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
            "image/gif",
            "image/heic",
            "image/heif",
          ]}
        />
        <Field
          label={labels.captionLabel}
          name="caption"
          defaultValue={d.caption}
          multiline
          rows={3}
        />
        <Field label={labels.altLabel} name="alt" defaultValue={d.alt} hint={labels.altHint} />
      </Section>

      <Section title={labels.detail}>
        <Row cols={2}>
          <Select
            label={labels.typeLabel}
            name="type"
            defaultValue={d.type}
            options={typeOptions}
          />
          <Select
            label={labels.aspectLabel}
            name="aspect"
            defaultValue={d.aspect}
            options={aspectOptions}
          />
        </Row>
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
        <Row cols={2}>
          <Field label={labels.locationLabel} name="location" defaultValue={d.location} />
          <Field
            label={labels.capturedAtLabel}
            name="capturedAt"
            defaultValue={d.capturedAt}
            hint={labels.capturedAtHint}
          />
        </Row>
        <Row cols={2}>
          <Checkbox label={labels.featuredLabel} name="featured" defaultChecked={d.featured} />
          <Checkbox label={labels.pinnedLabel} name="pinned" defaultChecked={d.pinned} />
        </Row>
      </Section>
    </AdminForm>
  );
}
