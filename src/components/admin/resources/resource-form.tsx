import type { ReactNode } from "react";
import type { AdminActionState } from "@/lib/admin/action-state";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, Row, Field, Select, Checkbox } from "@/components/admin/form-kit";
import { AiAssistButton } from "@/components/admin/ai-assist-button";
import { SlugField } from "@/components/admin/slug-field";
import type { Resource } from "@/content/schemas";

// Form used by /admin/resources/new and /admin/resources/[slug]. Server
// component — the field body is server-rendered and handed to the
// client <AdminForm> shell, which wires the action through
// useActionState for inline error/success feedback. Array fields
// serialize as newline-separated strings.

interface Labels {
  required: string;
  basics: string;
  detail: string;
  links: string;
  nameLabel: string;
  slugLabel: string;
  slugHint: string;
  categoryLabel: string;
  typeLabel: string;
  statusLabel: string;
  pricingLabel: string;
  sortOrderLabel: string;
  linkLabel: string;
  descriptionLabel: string;
  whyLabel: string;
  tagsLabel: string;
  tagsHint: string;
  iconKeyLabel: string;
  iconKeyHint: string;
  featured: string;
  submit: string;
  cancel: string;
  type: {
    link: string;
    tool: string;
  };
  status: {
    ready: string;
    draft: string;
    placeholder: string;
    comingSoon: string;
  };
}

export function ResourceForm({
  action,
  resource,
  labels,
  successMessage,
  hiddenFields,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  resource?: Resource & { id?: string; sortOrder?: number };
  labels: Labels;
  successMessage: string;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const typeOptions = [
    { value: "link", label: labels.type.link },
    { value: "tool", label: labels.type.tool },
  ];

  const statusOptions = [
    { value: "ready", label: labels.status.ready },
    { value: "draft", label: labels.status.draft },
    { value: "placeholder", label: labels.status.placeholder },
    { value: "coming-soon", label: labels.status.comingSoon },
  ];

  const d = {
    name: resource?.name ?? "",
    slug: resource?.slug ?? "",
    category: resource?.category ?? "",
    type: resource?.type ?? "link",
    status: resource?.status ?? "draft",
    pricing: resource?.pricing ?? "",
    sortOrder: String(resource?.sortOrder ?? 0),
    featured: resource?.featured ?? false,
    link: resource?.link ?? "",
    description: resource?.description ?? "",
    why: resource?.why ?? "",
    tags: resource?.tags?.join("\n") ?? "",
    iconKey: resource?.iconKey ?? "",
  };

  return (
    <AdminForm
      action={action}
      draftKey={`resources:${resource?.slug ?? "new"}`}
      submitLabel={labels.submit}
      cancelLabel={labels.cancel}
      cancelHref={cancelHref}
      successMessage={successMessage}
      hiddenFields={hiddenFields}
    >
      <Section title={labels.basics}>
        <Row cols={2}>
          <Field label={labels.nameLabel} name="name" defaultValue={d.name} required />
          <SlugField
            name="slug"
            sourceName="name"
            label={labels.slugLabel}
            hint={labels.slugHint}
            defaultValue={d.slug}
          />
        </Row>
        <Row cols={3}>
          <Field label={labels.categoryLabel} name="category" defaultValue={d.category} required />
          <Select
            label={labels.typeLabel}
            name="type"
            defaultValue={d.type}
            options={typeOptions}
          />
          <Select
            label={labels.statusLabel}
            name="status"
            defaultValue={d.status}
            options={statusOptions}
          />
        </Row>
        <Row cols={2}>
          <Field label={labels.pricingLabel} name="pricing" defaultValue={d.pricing} />
          <Field
            label={labels.sortOrderLabel}
            name="sortOrder"
            type="number"
            defaultValue={d.sortOrder}
          />
        </Row>
        <Checkbox label={labels.featured} name="featured" defaultChecked={d.featured} />
      </Section>

      <Section title={labels.detail}>
        <Field
          label={labels.descriptionLabel}
          name="description"
          defaultValue={d.description}
          multiline
          rows={3}
          required
          assist={
            <AiAssistButton
              task="shortPitch"
              target="description"
              sources={["name", "category", "why"]}
            />
          }
        />
        <Field
          label={labels.whyLabel}
          name="why"
          defaultValue={d.why}
          multiline
          rows={3}
          required
        />
        <Field
          label={labels.tagsLabel}
          name="tags"
          defaultValue={d.tags}
          hint={labels.tagsHint}
          multiline
          rows={4}
          assist={
            <AiAssistButton
              task="tags"
              target="tags"
              sources={["name", "category", "description", "why"]}
            />
          }
        />
        <Field
          label={labels.iconKeyLabel}
          name="iconKey"
          defaultValue={d.iconKey}
          hint={labels.iconKeyHint}
        />
      </Section>

      <Section title={labels.links}>
        <Field label={labels.linkLabel} name="link" type="url" defaultValue={d.link} required />
      </Section>
    </AdminForm>
  );
}
