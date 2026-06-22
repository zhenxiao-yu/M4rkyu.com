import type { ReactNode } from "react";
import type { AdminActionState } from "@/lib/admin/action-state";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, Row, Field, Select, Checkbox } from "@/components/admin/form-kit";
import { TagField } from "@/components/admin/tag-field";
import { AiAssistButton } from "@/components/admin/ai-assist-button";
import {
  ImageDropzone,
  type DropzoneLabels,
} from "@/components/admin/image-dropzone";
import { SlugField } from "@/components/admin/slug-field";
import type { Project } from "@/content/schemas";

// Form used by /admin/projects/new and /admin/projects/[slug]. Server
// component — the field body is server-rendered and handed to the
// client <AdminForm> shell, which wires the action through
// useActionState for inline error/success feedback. Array fields
// serialize as newline-separated strings.

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
  product: string;
  taglineLabel: string;
  taglineHint: string;
  timelineLabel: string;
  timelineHint: string;
  platformsLabel: string;
  platformsHint: string;
  stackGroupsLabel: string;
  stackGroupsHint: string;
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
  imageLabel: string;
  imageHint: string;
  imageReplaceHint: string;
  currentImage: string;
  dropzone: DropzoneLabels;
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
  coverImageSrc,
  coverImageUrl,
  labels,
  successMessage,
  hiddenFields,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  project?: Project & { id?: string; sortOrder?: number };
  /** External cover URL (cover_image_src column). Kept separate from the
   *  uploaded image so re-saving never writes a storage URL back into it. */
  coverImageSrc?: string;
  /** Resolved public URL of the uploaded cover (content-images bucket). */
  coverImageUrl?: string | null;
  labels: Labels;
  successMessage: string;
  hiddenFields?: ReactNode;
  cancelHref: string;
}) {
  const categoryOptions = (
    Object.entries(labels.category) as [keyof Labels["category"], string][]
  ).map(([value, label]) => ({ value, label }));

  const statusOptions = (
    Object.entries(labels.status) as [keyof Labels["status"], string][]
  ).map(([value, label]) => ({ value, label }));

  const contentStatusOptions = [
    { value: "ready", label: labels.contentStatus.ready },
    { value: "draft", label: labels.contentStatus.draft },
    { value: "placeholder", label: labels.contentStatus.placeholder },
    { value: "coming-soon", label: labels.contentStatus.comingSoon },
  ];

  const d = {
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
    tagline: project?.tagline ?? "",
    timeline: project?.timeline ?? "",
    platforms: project?.platforms?.join("\n") ?? "",
    stackGroups:
      project?.stackGroups
        ?.map((g) => `${g.group}: ${g.items.join(", ")}`)
        .join("\n") ?? "",
    tags: project?.tags?.join("\n") ?? "",
    features: project?.features?.join("\n") ?? "",
    architectureNotes: project?.architectureNotes?.join("\n") ?? "",
    challenges: project?.challenges?.join("\n") ?? "",
    lessonsLearned: project?.lessonsLearned?.join("\n") ?? "",
    nextSteps: project?.nextSteps?.join("\n") ?? "",
    liveUrl: project?.liveUrl ?? "",
    githubUrl: project?.githubUrl ?? "",
    coverImageSrc: coverImageSrc ?? project?.screenshots?.[0]?.src ?? "",
    coverImageAlt: project?.screenshots?.[0]?.alt ?? "",
    seoTitle: project?.seo?.title ?? "",
    seoDescription: project?.seo?.description ?? "",
    sortOrder: String(project?.sortOrder ?? 0),
  };

  return (
    <AdminForm
      action={action}
      draftKey={`projects:${project?.slug ?? "new"}`}
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
          <Field label={labels.yearLabel} name="year" defaultValue={d.year} required />
          <Select
            label={labels.categoryLabel}
            name="category"
            defaultValue={d.category}
            options={categoryOptions}
          />
          <Field
            label={labels.sortOrderLabel}
            name="sortOrder"
            type="number"
            defaultValue={d.sortOrder}
          />
        </Row>
        <Row cols={2}>
          <Select
            label={labels.statusLabel}
            name="status"
            defaultValue={d.status}
            options={statusOptions}
          />
          <Select
            label={labels.contentStatusLabel}
            name="contentStatus"
            defaultValue={d.contentStatus}
            options={contentStatusOptions}
          />
        </Row>
        <Checkbox label={labels.featured} name="featured" defaultChecked={d.featured} />
        <Field
          label={labels.shortPitchLabel}
          name="shortPitch"
          defaultValue={d.shortPitch}
          hint={labels.shortPitchHint}
          multiline
          rows={3}
          required
          assist={
            <AiAssistButton
              task="shortPitch"
              target="shortPitch"
              sources={["title", "problem", "solution", "outcome"]}
            />
          }
        />
      </Section>

      <Section title={labels.caseStudy}>
        <Field label={labels.problemLabel} name="problem" defaultValue={d.problem} multiline rows={4} />
        <Field label={labels.solutionLabel} name="solution" defaultValue={d.solution} multiline rows={4} />
        <Row cols={2}>
          <Field label={labels.roleLabel} name="role" defaultValue={d.role} multiline rows={3} />
          <Field label={labels.outcomeLabel} name="outcome" defaultValue={d.outcome} multiline rows={3} />
        </Row>
        <Row cols={2}>
          <TagField
            label={labels.stackLabel}
            name="stack"
            defaultValue={d.stack}
            hint={labels.stackHint}
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
                sources={["title", "shortPitch", "stack", "features"]}
              />
            }
          />
        </Row>
        <Row cols={2}>
          <Field label={labels.featuresLabel} name="features" defaultValue={d.features} multiline rows={5} />
          <Field
            label={labels.architectureLabel}
            name="architectureNotes"
            defaultValue={d.architectureNotes}
            multiline
            rows={5}
          />
        </Row>
        <Row cols={3}>
          <Field
            label={labels.challengesLabel}
            name="challenges"
            defaultValue={d.challenges}
            multiline
            rows={4}
          />
          <Field
            label={labels.lessonsLabel}
            name="lessonsLearned"
            defaultValue={d.lessonsLearned}
            multiline
            rows={4}
          />
          <Field
            label={labels.nextStepsLabel}
            name="nextSteps"
            defaultValue={d.nextSteps}
            multiline
            rows={4}
          />
        </Row>
      </Section>

      <Section title={labels.product}>
        <Field
          label={labels.taglineLabel}
          name="tagline"
          defaultValue={d.tagline}
          hint={labels.taglineHint}
        />
        <Row cols={2}>
          <Field
            label={labels.timelineLabel}
            name="timeline"
            defaultValue={d.timeline}
            hint={labels.timelineHint}
          />
          <TagField
            label={labels.platformsLabel}
            name="platforms"
            defaultValue={d.platforms}
            hint={labels.platformsHint}
          />
        </Row>
        <Field
          label={labels.stackGroupsLabel}
          name="stackGroups"
          defaultValue={d.stackGroups}
          hint={labels.stackGroupsHint}
          multiline
          rows={5}
        />
      </Section>

      <Section title={labels.links}>
        <Row cols={2}>
          <Field label={labels.liveUrlLabel} name="liveUrl" type="url" defaultValue={d.liveUrl} />
          <Field label={labels.githubUrlLabel} name="githubUrl" type="url" defaultValue={d.githubUrl} />
        </Row>
      </Section>

      <Section title={labels.cover}>
        <ImageDropzone
          name="image"
          label={labels.imageLabel}
          hint={coverImageUrl ? labels.imageReplaceHint : labels.imageHint}
          labels={labels.dropzone}
          currentImageUrl={coverImageUrl}
        />
        <Row cols={2}>
          <Field label={labels.coverSrcLabel} name="coverImageSrc" defaultValue={d.coverImageSrc} />
          <Field label={labels.coverAltLabel} name="coverImageAlt" defaultValue={d.coverImageAlt} />
        </Row>
      </Section>

      <Section title={labels.seo}>
        <Field
          label={labels.seoTitleLabel}
          name="seoTitle"
          defaultValue={d.seoTitle}
          assist={
            <AiAssistButton
              task="seoTitle"
              target="seoTitle"
              sources={["title", "shortPitch", "tagline"]}
            />
          }
        />
        <Field
          label={labels.seoDescriptionLabel}
          name="seoDescription"
          defaultValue={d.seoDescription}
          multiline
          rows={2}
          assist={
            <AiAssistButton
              task="seoDescription"
              target="seoDescription"
              sources={["title", "shortPitch", "problem", "solution"]}
            />
          }
        />
      </Section>
    </AdminForm>
  );
}
