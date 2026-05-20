import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Resource } from "@/content/schemas";

// Shared form used by both /admin/resources/new and
// /admin/resources/[slug]. Server component — all interactivity flows
// through native form submission to the server actions. Array fields
// serialize as newline-separated strings.

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
  hiddenFields,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  resource?: Resource & { id?: string; sortOrder?: number };
  labels: Labels;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const defaults = {
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
    <form action={action} className="grid gap-8">
      {hiddenFields}

      <Section title={labels.basics}>
        <Row cols={2}>
          <Field
            label={labels.nameLabel}
            name="name"
            defaultValue={defaults.name}
            required
          />
          <Field
            label={labels.slugLabel}
            name="slug"
            defaultValue={defaults.slug}
            pattern="[a-z0-9-]+"
            hint={labels.slugHint}
            required
          />
        </Row>
        <Row cols={3}>
          <Field
            label={labels.categoryLabel}
            name="category"
            defaultValue={defaults.category}
            required
          />
          <Select
            label={labels.typeLabel}
            name="type"
            defaultValue={defaults.type}
            options={[
              { value: "link", label: labels.type.link },
              { value: "tool", label: labels.type.tool },
            ]}
          />
          <Select
            label={labels.statusLabel}
            name="status"
            defaultValue={defaults.status}
            options={[
              { value: "ready", label: labels.status.ready },
              { value: "draft", label: labels.status.draft },
              { value: "placeholder", label: labels.status.placeholder },
              { value: "coming-soon", label: labels.status.comingSoon },
            ]}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.pricingLabel}
            name="pricing"
            defaultValue={defaults.pricing}
          />
          <Field
            label={labels.sortOrderLabel}
            name="sortOrder"
            type="number"
            defaultValue={defaults.sortOrder}
          />
        </Row>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={defaults.featured}
            className="size-4 rounded border-border accent-ring"
          />
          <span>{labels.featured}</span>
        </label>
      </Section>

      <Section title={labels.detail}>
        <Field
          label={labels.descriptionLabel}
          name="description"
          defaultValue={defaults.description}
          multiline
          rows={3}
          required
        />
        <Field
          label={labels.whyLabel}
          name="why"
          defaultValue={defaults.why}
          multiline
          rows={3}
          required
        />
        <Field
          label={labels.tagsLabel}
          name="tags"
          defaultValue={defaults.tags}
          hint={labels.tagsHint}
          multiline
          rows={4}
        />
        <Field
          label={labels.iconKeyLabel}
          name="iconKey"
          defaultValue={defaults.iconKey}
          hint={labels.iconKeyHint}
        />
      </Section>

      <Section title={labels.links}>
        <Field
          label={labels.linkLabel}
          name="link"
          type="url"
          defaultValue={defaults.link}
          required
        />
      </Section>

      <div className="flex justify-end gap-2 border-t border-border/60 pt-6">
        <Button asChild variant="ghost" size="sm">
          <a href={cancelHref}>{labels.cancel}</a>
        </Button>
        <SubmitButton size="sm">{labels.submit}</SubmitButton>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 rounded-lg border border-border/60 bg-card/60 p-5">
      <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Row({ cols, children }: { cols: 2 | 3; children: ReactNode }) {
  // 3-col rows wait until md (768px) so labels + textareas don't get
  // crushed at 360px; 2-col rows kick in at sm (640px), which is
  // already roomy enough for two short fields.
  return (
    <div
      className={
        cols === 2 ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 md:grid-cols-3"
      }
    >
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  multiline,
  rows,
  hint,
  pattern,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  pattern?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={rows ?? 4}
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
      <select name={name} defaultValue={defaultValue} className={inputClass}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
