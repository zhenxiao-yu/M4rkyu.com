import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "../../_components/admin-nav";
import { AdminForm } from "@/components/admin/admin-form";
import { profile } from "@/content/profile";
import { env } from "@/lib/env";
import { fetchUserRepos, repoToProjectDraft } from "@/lib/github/repos";
import { getProjectsSource } from "@/lib/projects/source";
import { importGithubReposAction } from "@/lib/projects/github-sync";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsSyncPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminProjects" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  const [repos, existing] = await Promise.all([
    fetchUserRepos(profile.githubHandle ?? "", env.GITHUB_TOKEN),
    getProjectsSource(),
  ]);
  const existingSlugs = new Set(existing.map((p) => p.slug));
  const drafts = repos.map(repoToProjectDraft);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("syncTitle")}
        description={t("syncDescription")}
        decorativeWord="SYNC"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3 h-auto px-3">
            <Link href="/admin/projects" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToProjects")}
            </Link>
          </Button>
        </div>

        {drafts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("syncEmpty")}</p>
        ) : (
          <AdminForm
            action={importGithubReposAction}
            submitLabel={t("syncSubmit")}
            cancelLabel={t("backToProjects")}
            cancelHref={`/${locale}/admin/projects`}
            successMessage={tAdmin("saved")}
          >
            <ul className="grid list-none grid-cols-1 gap-2 p-0">
              {drafts.map((d) => {
                const exists = existingSlugs.has(d.slug);
                return (
                  <li key={d.slug}>
                    <label
                      className={cn(
                        "flex gap-3 rounded-lg border border-border bg-background/60 p-3 transition-colors hover:border-ring/50",
                        exists && "opacity-50",
                      )}
                    >
                      <input
                        type="checkbox"
                        name="repos"
                        value={JSON.stringify(d)}
                        disabled={exists}
                        className="mt-1 size-4 shrink-0"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {d.title}
                          </span>
                          {exists ? (
                            <span className="rounded-full border border-border px-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                              {t("syncExists")}
                            </span>
                          ) : null}
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {d.shortPitch}
                        </span>
                        <span className="mt-1 block font-mono text-[0.65rem] text-muted-foreground/70">
                          {[
                            d.stack.join(", "),
                            d.year,
                            d.stars ? `★ ${d.stars}` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </AdminForm>
        )}
      </PageSection>
    </PageShell>
  );
}
