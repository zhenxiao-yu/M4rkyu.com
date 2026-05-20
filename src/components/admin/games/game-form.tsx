import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Game } from "@/content/schemas";

// Shared form used by both /admin/games/new and /admin/games/[slug].
// Server component — all interactivity flows through native form
// submission to the server actions. Array fields serialize as
// newline-separated strings; build links serialize one per line as
// `Label|https://url`.

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface Labels {
  required: string;
  basics: string;
  detail: string;
  media: string;
  titleLabel: string;
  slugLabel: string;
  slugHint: string;
  engineLabel: string;
  yearLabel: string;
  statusLabel: string;
  sortOrderLabel: string;
  pitchLabel: string;
  roleLabel: string;
  notesLabel: string;
  notesHint: string;
  platformsLabel: string;
  pillarsLabel: string;
  postmortemLabel: string;
  outcomeLabel: string;
  coverSrcLabel: string;
  coverAltLabel: string;
  trailerUrlLabel: string;
  buildLinksLabel: string;
  buildLinksHint: string;
  submit: string;
  cancel: string;
  status: {
    ready: string;
    draft: string;
    placeholder: string;
    comingSoon: string;
  };
}

export function GameForm({
  action,
  game,
  labels,
  hiddenFields,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  game?: Game & { id?: string; sortOrder?: number };
  labels: Labels;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const defaults = {
    title: game?.title ?? "",
    slug: game?.slug ?? "",
    engine: game?.engine ?? "",
    year: game?.year ?? new Date().getFullYear().toString(),
    status: game?.status ?? "draft",
    sortOrder: String(game?.sortOrder ?? 0),
    pitch: game?.pitch ?? "",
    role: game?.role ?? "",
    notes: game?.notes?.join("\n") ?? "",
    platforms: game?.platforms?.join("\n") ?? "",
    pillars: game?.pillars?.join("\n") ?? "",
    postmortem: game?.postmortem ?? "",
    outcome: game?.outcome ?? "",
    coverSrc: game?.cover?.src ?? "",
    coverAlt: game?.cover?.alt ?? "",
    trailerUrl: game?.trailerUrl ?? "",
    buildLinks:
      game?.buildLinks?.map((link) => `${link.label}|${link.url}`).join("\n") ??
      "",
  };

  return (
    <form action={action} className="grid gap-8">
      {hiddenFields}

      <Section title={labels.basics}>
        <Row cols={2}>
          <Field
            label={labels.titleLabel}
            name="title"
            defaultValue={defaults.title}
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
        <Row cols={2}>
          <Field
            label={labels.engineLabel}
            name="engine"
            defaultValue={defaults.engine}
            required
          />
          <Field
            label={labels.yearLabel}
            name="year"
            defaultValue={defaults.year}
            required
          />
        </Row>
        <Row cols={2}>
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
          <Field
            label={labels.sortOrderLabel}
            name="sortOrder"
            type="number"
            defaultValue={defaults.sortOrder}
          />
        </Row>
        <Field
          label={labels.pitchLabel}
          name="pitch"
          defaultValue={defaults.pitch}
          multiline
          rows={3}
          required
        />
      </Section>

      <Section title={labels.detail}>
        <Field
          label={labels.roleLabel}
          name="role"
          defaultValue={defaults.role}
          multiline
          rows={3}
        />
        <Field
          label={labels.notesLabel}
          name="notes"
          defaultValue={defaults.notes}
          hint={labels.notesHint}
          multiline
          rows={5}
        />
        <Row cols={2}>
          <Field
            label={labels.platformsLabel}
            name="platforms"
            defaultValue={defaults.platforms}
            multiline
            rows={4}
          />
          <Field
            label={labels.pillarsLabel}
            name="pillars"
            defaultValue={defaults.pillars}
            multiline
            rows={4}
          />
        </Row>
        <Field
          label={labels.postmortemLabel}
          name="postmortem"
          defaultValue={defaults.postmortem}
          multiline
          rows={4}
        />
        <Field
          label={labels.outcomeLabel}
          name="outcome"
          defaultValue={defaults.outcome}
          multiline
          rows={3}
        />
      </Section>

      <Section title={labels.media}>
        <Row cols={2}>
          <Field
            label={labels.coverSrcLabel}
            name="coverSrc"
            defaultValue={defaults.coverSrc}
          />
          <Field
            label={labels.coverAltLabel}
            name="coverAlt"
            defaultValue={defaults.coverAlt}
          />
        </Row>
        <Field
          label={labels.trailerUrlLabel}
          name="trailerUrl"
          type="url"
          defaultValue={defaults.trailerUrl}
        />
        <Field
          label={labels.buildLinksLabel}
          name="buildLinks"
          defaultValue={defaults.buildLinks}
          hint={labels.buildLinksHint}
          multiline
          rows={4}
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
