import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BentoGrid } from "@/components/about/bento-fx";
import { MissionModuleCard } from "@/components/ui/pixel/mission-module-card";
import { SystemBadge } from "@/components/ui/pixel/system-badge";
import { HomeSection } from "./home-section";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/content/localize";
import type { Project } from "@/content/schemas";
import { cn, FOCUS_RING } from "@/lib/utils";

interface SelectedWorkProps {
  locale: Locale;
  projects: Project[];
}

/**
 * Selected-work showcase. Uses the canonical MissionModuleCard (same
 * card the /work page renders) so the home matches the rest of the
 * site: cartridge notch, status badge, grayscale→color cover. The hero
 * project wears the section's single BorderBeam.
 *
 * Scales with content:
 *   - 0 ready: only the draft strip renders.
 *   - 1 ready: the hero card spans wide on its own.
 *   - 2+ ready: hero (wide) + the rest in uniform cells.
 *   - Drafts cap at 5 dimmed, non-linked tiles (no /work/[slug] yet).
 */
export async function SelectedWork({ locale, projects }: SelectedWorkProps) {
  const t = await getTranslations({ locale, namespace: "Home.selectedWork" });

  const ready = projects.filter((p) => p.contentStatus === "ready");
  const hero = ready[0];
  const rest = ready.slice(1);
  const drafts = projects
    .filter((p) => p.contentStatus !== "ready")
    .slice(0, 5);

  return (
    <HomeSection
      tone="muted"
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <Link
          href="/work"
          locale={locale}
          className={cn(
            "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring",
            FOCUS_RING,
          )}
        >
          {t("openWork")}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
      dataSection="selected-work"
    >
      {/* BentoGrid drives the staggered fade-up reveal. */}
      <BentoGrid className="grid grid-cols-1 gap-5 md:grid-cols-6">
        {hero ? (
          <div className="md:col-span-4">
            <MissionModuleCard project={hero} locale={locale} highlighted />
          </div>
        ) : null}
        {rest.map((project) => (
          <div key={project.slug} className="md:col-span-2">
            <MissionModuleCard project={project} locale={locale} />
          </div>
        ))}
      </BentoGrid>

      {/* Drafts strip — dimmed, non-linked (slug pages may not exist). */}
      {drafts.length > 0 ? (
        <div className="mt-12">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("draftsLabel")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {drafts.map((project) => (
              <DraftTile key={project.slug} project={project} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}
    </HomeSection>
  );
}

async function DraftTile({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const tStatus = await getTranslations({ locale, namespace: "Status" });
  const localized = localize(project, locale);
  const cover = project.screenshots[0];

  // Pending/placeholder work slot. opacity-75 (not 60) keeps the dimmed
  // "coming soon" read while lifting the muted `cover · tbd` label above the
  // 4.5:1 contrast floor — parent opacity caps all descendants, so the label
  // can't be fixed in isolation (WCAG 1.4.3).
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground opacity-75 grayscale transition-[opacity,filter] duration-(--motion-base) ease-(--ease-premium) hover:opacity-100 hover:grayscale-0">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              cover · tbd
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <SystemBadge
          status={project.contentStatus}
          label={tStatus(project.contentStatus)}
        />
        <h3 className="text-sm font-semibold leading-tight">
          {localized.title as string}
        </h3>
      </div>
    </div>
  );
}
