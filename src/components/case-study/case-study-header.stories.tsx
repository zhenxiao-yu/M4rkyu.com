// Visual approximation; the production component is async and reads getTranslations.
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import { allProjects } from "@/content/projects";
import type { Project } from "@/content/schemas";

function CaseStudyHeaderClone({ project }: { project: Project }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-cyber-grid opacity-30" aria-hidden="true" />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Link
          href="/work"
          className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to projects
        </Link>
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{project.category}</Badge>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {project.year}
          </span>
          <Badge variant={project.status === "ready" ? "success" : "outline"}>
            {project.status}
          </Badge>
          {project.contentStatus !== "ready" ? (
            <DraftBadge label={project.contentStatus} />
          ) : null}
        </div>
        <h1 className="mt-6 max-w-5xl text-balance font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-tight">
          {project.title}
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
          {project.shortPitch}
        </p>
        <dl className="mt-10 grid gap-6 border-t pt-6 sm:grid-cols-[auto_1fr] sm:gap-x-10">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            Role
          </dt>
          <dd className="text-sm leading-7 text-foreground">{project.role}</dd>
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            Stack
          </dt>
          <dd className="flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <Badge key={item} variant="outline" className="text-[0.65rem]">
                {item}
              </Badge>
            ))}
          </dd>
          {project.liveUrl || project.githubUrl ? (
            <>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Links
              </dt>
              <dd className="flex flex-wrap gap-2">
                {project.liveUrl ? (
                  <Button asChild size="sm">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  </Button>
                ) : null}
                {project.githubUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source
                    </a>
                  </Button>
                ) : null}
              </dd>
            </>
          ) : null}
        </dl>
      </div>
    </section>
  );
}

const meta = {
  title: "case-study/CaseStudyHeader",
  component: CaseStudyHeaderClone,
} satisfies Meta<typeof CaseStudyHeaderClone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProductionProject: Story = { args: { project: allProjects[0] } };

export const DraftProject: Story = {
  args: {
    project: {
      ...allProjects[0],
      title: "Placeholder case study",
      contentStatus: "draft",
      status: "draft",
    },
  },
};
