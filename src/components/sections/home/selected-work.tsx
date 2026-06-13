import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { MissionModuleCard } from "@/components/ui/pixel/mission-module-card";
import { SystemBadge } from "@/components/ui/pixel/system-badge";
import { HomeSection } from "./home-section";
import { SectionActionLink } from "./section-action-link";
import { SectionBackground } from "./section-background";
import { SelectedWorkRail } from "./selected-work-rail";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/content/localize";
import type { Project } from "@/content/schemas";
import { cn } from "@/lib/utils";

interface SelectedWorkProps {
  locale: Locale;
  projects: Project[];
}

/**
 * Selected-work slide — a horizontal "production line" you scrub through.
 * Ready projects ride up front as numbered mission-file frames; a vertical
 * divider, then the drafts trailing behind, dimmed + desaturated until you
 * hover. The single-row rail keeps the whole slide inside one viewport
 * (the old bento + draft strip overflowed the snap stage on tall content).
 *
 * Cards stay the canonical `MissionModuleCard` so /home matches /work.
 * Scroll mechanics + nav live in the `SelectedWorkRail` client shell; the
 * cards arrive as server-rendered children.
 *
 * Scales with content:
 *   - 0 ready: only the dimmed draft frames render.
 *   - N ready: numbered 01…N, the first wearing the section's lone beam.
 *   - Drafts cap at 6 dimmed, non-linked frames behind the divider.
 */
export async function SelectedWork({ locale, projects }: SelectedWorkProps) {
  const t = await getTranslations({ locale, namespace: "Home.selectedWork" });

  const ready = projects.filter((p) => p.contentStatus === "ready");
  const drafts = projects
    .filter((p) => p.contentStatus !== "ready")
    .slice(0, 6);

  return (
    <HomeSection
      tone="default"
      background={<SectionBackground variant="blueprint" />}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <SectionActionLink href="/work" locale={locale}>
          {t("openWork")}
        </SectionActionLink>
      }
      dataSection="selected-work"
    >
      {ready.length > 0 || drafts.length > 0 ? (
        <SelectedWorkRail
          prevLabel={t("prev")}
          nextLabel={t("next")}
          railLabel={t("railLabel")}
        >
          {ready.map((project, index) => (
            <RailFrame key={project.slug} index={index + 1}>
              <MissionModuleCard
                project={project}
                locale={locale}
                highlighted={index === 0}
              />
            </RailFrame>
          ))}

          {drafts.length > 0 ? (
            <DraftDivider label={t("draftsLabel")} />
          ) : null}

          {drafts.map((project) => (
            <RailFrame key={project.slug} draft draftLabel={t("draftsLabel")}>
              <DraftRailCard project={project} locale={locale} />
            </RailFrame>
          ))}
        </SelectedWorkRail>
      ) : null}
    </HomeSection>
  );
}

/**
 * One numbered frame in the rail. Ready frames show a catalog index +
 * accent tick; draft frames swap the index for a muted label and dim the
 * card until hover (the "behind the line" read).
 */
function RailFrame({
  index,
  draft = false,
  draftLabel,
  children,
}: {
  index?: number;
  draft?: boolean;
  draftLabel?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-rail-slide
      className="group/frame flex w-[80vw] max-w-[20rem] shrink-0 snap-start flex-col gap-2.5 sm:w-[19rem]"
    >
      <div className="flex items-center gap-2 px-0.5">
        {draft ? (
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-muted-foreground/70">
            {draftLabel}
          </span>
        ) : (
          <span className="font-mono text-[0.66rem] tabular-nums text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
        )}
        <span aria-hidden="true" className="h-px flex-1 bg-border/70" />
        <span
          aria-hidden="true"
          className={cn(
            "size-1 rounded-full",
            draft ? "bg-muted-foreground/40" : "bg-ring/70",
          )}
        />
      </div>
      <div
        className={cn(
          "min-h-0 flex-1",
          draft &&
            "opacity-75 [@media(pointer:fine)]:grayscale transition-[opacity,filter] duration-(--motion-base) ease-(--ease-premium) group-hover/frame:opacity-100 [@media(pointer:fine)]:group-hover/frame:grayscale-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Vertical divider that separates shipped frames from the draft tail. */
function DraftDivider({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-stretch px-1 sm:px-2" aria-hidden="true">
      <div className="flex flex-col items-center justify-center gap-3 self-stretch">
        <span className="w-px flex-1 bg-linear-to-b from-transparent via-border to-border" />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl]">
          {label}
        </span>
        <span className="w-px flex-1 bg-linear-to-b from-border via-border to-transparent" />
      </div>
    </div>
  );
}

/**
 * Draft frame card — mirrors MissionModuleCard's anatomy (16:10 cover,
 * status badge, year, title) but stays non-linked: draft slugs aren't
 * promoted from the home. The dim/desaturate lives on the RailFrame so
 * the whole frame lifts together on hover.
 */
async function DraftRailCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const tStatus = await getTranslations({ locale, namespace: "Status" });
  const tProjects = await getTranslations({ locale, namespace: "Projects" });
  const localized = localize(project, locale);
  const cover = project.screenshots[0];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground">
      <div className="relative aspect-16/10 w-full overflow-hidden border-b bg-muted">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 640px) 80vw, 19rem"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              {tProjects("mediaTbd")}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <SystemBadge
            status={project.contentStatus}
            label={tStatus(project.contentStatus)}
          />
          <span className="font-mono text-xs text-muted-foreground">
            {project.year}
          </span>
        </div>
        <h3 className="text-sm font-semibold leading-snug text-foreground">
          {localized.title as string}
        </h3>
      </div>
    </div>
  );
}
