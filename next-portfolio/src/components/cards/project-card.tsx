import Image from "next/image";
import { ArrowUpRight, Code } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/content/localize";
import type { Project } from "@/content/schemas";

export async function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "Projects" });
  const localized = localize(project, locale);
  const cover = project.screenshots[0];
  const isDraft = project.contentStatus !== "ready";

  return (
    <Card className="group overflow-hidden rounded-lg bg-card/80 transition-colors hover:border-ring">
      <div className="relative aspect-[16/10] overflow-hidden border-b bg-muted">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
          />
        ) : (
          <PlaceholderImage label="PROJECT MEDIA TBD" aspect="h-full" className="rounded-none border-0" />
        )}
      </div>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={project.featured ? "success" : "outline"}>{project.status}</Badge>
            {isDraft ? <DraftBadge label={project.contentStatus} /> : null}
          </div>
          <span className="font-mono text-xs text-muted-foreground">{project.year}</span>
        </div>
        <CardTitle>{localized.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="min-h-16 text-sm leading-6 text-muted-foreground">
          {localized.shortPitch as string}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.stack.slice(0, 4).map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/projects/${project.slug}`} locale={locale}>
              {t("caseStudy")}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          {project.githubUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Code className="size-4" />
                {t("source")}
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
