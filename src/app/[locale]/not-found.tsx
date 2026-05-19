import { getLocale, getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/cards/project-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProjectsSource } from "@/lib/projects/source";

export default async function NotFoundPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("NotFound");
  const allProjects = await getProjectsSource();
  const readyProjects = allProjects
    .filter((p) => p.contentStatus === "ready")
    .slice(0, 3);

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-25" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <FadeIn>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t("eyebrow")}
              </p>
              <h1 className="mt-6 text-balance font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none">
                {t("title")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
                {t("subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/" locale={locale}>
                    {t("home")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/archive" locale={locale}>
                    {t("gallery")}
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {readyProjects.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow={t("archiveEyebrow")}
              title={t("archiveTitle")}
            />
          </FadeIn>
          <Stagger className="mt-8 grid gap-5 md:grid-cols-3" delay={0.08}>
            {readyProjects.map((project) => (
              <StaggerItem key={project.slug}>
                <ProjectCard project={project} locale={locale} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}
    </PageShell>
  );
}
