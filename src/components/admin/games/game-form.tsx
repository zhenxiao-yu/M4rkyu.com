import type { ReactNode } from "react";
import type { AdminActionState } from "@/lib/admin/action-state";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, Row, Field, Select } from "@/components/admin/form-kit";
import { TagField } from "@/components/admin/tag-field";
import { AiAssistButton } from "@/components/admin/ai-assist-button";
import { SlugField } from "@/components/admin/slug-field";
import type { Game } from "@/content/schemas";

// Form used by /admin/games/new and /admin/games/[slug]. Server
// component — the field body is server-rendered and handed to the
// client <AdminForm> shell, which wires the action through
// useActionState for inline error/success feedback.

interface Labels {
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
  successMessage,
  hiddenFields,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  game?: Game & { id?: string; sortOrder?: number };
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
    <AdminForm
      action={action}
      draftKey={`games:${game?.slug ?? "new"}`}
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
        <Row cols={2}>
          <Field label={labels.engineLabel} name="engine" defaultValue={d.engine} required />
          <Field label={labels.yearLabel} name="year" defaultValue={d.year} required />
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
        <Field
          label={labels.pitchLabel}
          name="pitch"
          defaultValue={d.pitch}
          multiline
          rows={3}
          required
          assist={
            <AiAssistButton
              task="shortPitch"
              target="pitch"
              sources={["title", "role", "outcome", "pillars"]}
            />
          }
        />
      </Section>

      <Section title={labels.detail}>
        <Field label={labels.roleLabel} name="role" defaultValue={d.role} multiline rows={3} />
        <Field
          label={labels.notesLabel}
          name="notes"
          defaultValue={d.notes}
          hint={labels.notesHint}
          multiline
          rows={5}
        />
        <Row cols={2}>
          <TagField label={labels.platformsLabel} name="platforms" defaultValue={d.platforms} />
          <TagField label={labels.pillarsLabel} name="pillars" defaultValue={d.pillars} />
        </Row>
        <Field label={labels.postmortemLabel} name="postmortem" defaultValue={d.postmortem} multiline rows={4} />
        <Field label={labels.outcomeLabel} name="outcome" defaultValue={d.outcome} multiline rows={3} />
      </Section>

      <Section title={labels.media}>
        <Row cols={2}>
          <Field label={labels.coverSrcLabel} name="coverSrc" defaultValue={d.coverSrc} />
          <Field label={labels.coverAltLabel} name="coverAlt" defaultValue={d.coverAlt} />
        </Row>
        <Field label={labels.trailerUrlLabel} name="trailerUrl" type="url" defaultValue={d.trailerUrl} />
        <Field
          label={labels.buildLinksLabel}
          name="buildLinks"
          defaultValue={d.buildLinks}
          hint={labels.buildLinksHint}
          multiline
          rows={4}
        />
      </Section>
    </AdminForm>
  );
}
