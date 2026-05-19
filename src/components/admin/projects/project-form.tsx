import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Project } from "@/content/schemas";

// Shared form used by both /admin/projects/new and /admin/projects/[slug].
// Server component — all interactivity flows through native form
// submission to the server actions. Array fields serialize as
// newline-separated strings.

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface Labels {
  required: string;
  basics: string;
  titleLabel: string;
  slugLabel: string;
  slugHint: string;
  yearLabel: string;
  categoryLabel: string;
  statusLabel: string;
  contentStatusLabel: string;
  featured: string;
  shortPitchLabel: string;
  shortPitchHint: string;
  caseStudy: string;
  problemLabel: string;
  solutionLabel: string;
  roleLabel: string;
  outcomeLabel: string;
  stackLabel: string;
  stackHint: string;
  tagsLabel: string;
  tagsHint: string;
  featuresLabel: string;
  architectureLabel: string;
  challengesLabel: string;
  lessonsLabel: string;
  nextStepsLabel: string;
  links: string;
  liveUrlLabel: string;
  githubUrlLabel: string;
  cover: string;
  coverSrcLabel: string;
  coverAltLabel: string;
  seo: string;
  seoTitleLabel: string;
  seoDescriptionLabel: string;
  sortOrderLabel: string;
  submit: string;
  cancel: string;
  category: {
    "web-app": string;
    "game-dev": string;
    "ai-tool": string;
    "art-film": string;
    experiment: string;
    maintenance: string;
  };
  status: {
    ready: string;
    development: string;
    maintenance: string;
    archived: string;
    draft: string;
  };
  contentStatus: {
    ready: string;
    draft: string;
    placeholder: string;
    comingSoon: string;
  };
}

export function ProjectForm({
  action,
  project,
  labels,
  hiddenFields,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  project?: Project & { id?: string; sortOrder?: number };
  labels: Labels;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const defaults = {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    shortPitch: project?.shortPitch ?? "",
    category: project?.category ?? "web-app",
    year: project?.year ?? new Date().getFullYear().toString(),
    status: project?.status ?? "draft",
    contentStatus: project?.contentStatus ?? "draft",
    featured: project?.featured ?? false,
    problem: project?.problem ?? "",
    solution: project?.solution ?? "",
    role: project?.role ?? "",
    outcome: project?.outcome ?? "",
    stack: project?.stack?.join("\n") ?? "",
    tags: project?.tags?.join("\n") ?? "",
    features: project?.features?.join("\n") ?? "",
    architectureNotes: project?.architectureNotes?.join("\n") ?? "",
    challenges: project?.challenges?.join("\n") ?? "",
    lessonsLearned: project?.lessonsLearned?.join("\n") ?? "",
    nextSteps: project?.nextSteps?.join("\n") ?? "",
    liveUrl: project?.liveUrl ?? "",
    githubUrl: project?.githubUrl ?? "",
    coverImageSrc: project?.screenshots?.[0]?.src ?? "",
    coverImageAlt: project?.screenshots?.[0]?.alt ?? "",
    seoTitle: project?.seo?.title ?? "",
    seoDescription: project?.seo?.description ?? "",
    sortOrder: String(project?.sortOrder ?? 0),
  };

  return (
    <form action={action} className="grid gap-8">
      {hiddenFields}

      <Section title={labels.basics}>
        <Row cols={2}>
          <Field label={labels.titleLabel} name="title" defaultValue={defaults.title} required />
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
            label={labels.yearLabel}
            name="year"
            defaultValue={defaults.year}
            required
          />
          <Select
            label={labels.categoryLabel}
            name="category"
            defaultValue={defaults.category}
            options={(
              Object.entries(labels.category) as [keyof Labels["category"], string][]
            ).map(([value, label]) => ({ value, label }))}
          />
          <Field
            label={labels.sortOrderLabel}
            name="sortOrder"
            type="number"
            defaultValue={defaults.sortOrder}
          />
        </Row>
        <Row cols={2}>
          <Select
            label={labels.statusLabel}
            name="status"
            defaultValue={defaults.status}
            options={(
              Object.entries(labels.status) as [keyof Labels["status"], string][]
            ).map(([value, label]) => ({ value, label }))}
          />
          <Select
            label={labels.contentStatusLabel}
            name="contentStatus"
            defaultValue={defaults.contentStatus}
            options={[
              { value: "ready", label: labels.contentStatus.ready },
              { value: "draft", label: labels.contentStatus.draft },
              { value: "placeholder", label: labels.contentStatus.placeholder },
              { value: "coming-soon", label: labels.contentStatus.comingSoon },
            ]}
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
        <Field
          label={labels.shortPitchLabel}
          name="shortPitch"
          defaultValue={defaults.shortPitch}
          hint={labels.shortPitchHint}
          multiline
          rows={3}
          required
        />
      </Section>

      <Section title={labels.caseStudy}>
        <Field
          label={labels.problemLabel}
          name="problem"
          defaultValue={defaults.problem}
          multiline
          rows={4}
        />
        <Field
          label={labels.solutionLabel}
          name="solution"
          defaultValue={defaults.solution}
          multiline
          rows={4}
        />
        <Row cols={2}>
          <Field
            label={labels.roleLabel}
            name="role"
            defaultValue={defaults.role}
            multiline
            rows={3}
          />
          <Field
            label={labels.outcomeLabel}
            name="outcome"
            defaultValue={defaults.outcome}
            multiline
            rows={3}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.stackLabel}
            name="stack"
            defaultValue={defaults.stack}
            hint={labels.stackHint}
            multiline
            rows={4}
          />
          <Field
            label={labels.tagsLabel}
            name="tags"
            defaultValue={defaults.tags}
            hint={labels.tagsHint}
            multiline
            rows={4}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.featuresLabel}
            name="features"
            defaultValue={defaults.features}
            multiline
            rows={5}
          />
          <Field
            label={labels.architectureLabel}
            name="architectureNotes"
            defaultValue={defaults.architectureNotes}
            multiline
            rows={5}
          />
        </Row>
        <Row cols={3}>
          <Field
            label={labels.challengesLabel}
            name="challenges"
            defaultValue={defaults.challenges}
            multiline
            rows={4}
          />
          <Field
            label={labels.lessonsLabel}
            name="lessonsLearned"
            defaultValue={defaults.lessonsLearned}
            multiline
            rows={4}
          />
          <Field
            label={labels.nextStepsLabel}
            name="nextSteps"
            defaultValue={defaults.nextSteps}
            multiline
            rows={4}
          />
        </Row>
      </Section>

      <Section title={labels.links}>
        <Row cols={2}>
          <Field
            label={labels.liveUrlLabel}
            name="liveUrl"
            type="url"
            defaultValue={defaults.liveUrl}
          />
          <Field
            label={labels.githubUrlLabel}
            name="githubUrl"
            type="url"
            defaultValue={defaults.githubUrl}
          />
        </Row>
      </Section>

      <Section title={labels.cover}>
        <Row cols={2}>
          <Field
            label={labels.coverSrcLabel}
            name="coverImageSrc"
            defaultValue={defaults.coverImageSrc}
          />
          <Field
            label={labels.coverAltLabel}
            name="coverImageAlt"
            defaultValue={defaults.coverImageAlt}
          />
        </Row>
      </Section>

      <Section title={labels.seo}>
        <Field
          label={labels.seoTitleLabel}
          name="seoTitle"
          defaultValue={defaults.seoTitle}
        />
        <Field
          label={labels.seoDescriptionLabel}
          name="seoDescription"
          defaultValue={defaults.seoDescription}
          multiline
          rows={2}
        />
      </Section>

      <div className="flex justify-end gap-2 border-t border-border/60 pt-6">
        <Button asChild variant="ghost" size="sm">
          <a href={cancelHref}>{labels.cancel}</a>
        </Button>
        <SubmitButton size="sm">
          {labels.submit}
        </SubmitButton>
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
