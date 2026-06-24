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
import { cn } from "@/lib/utils";

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
        <div className="relative mx-auto w-full max-w-page px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <FadeIn>
            <div className="flex flex-col items-start gap-12 sm:gap-16">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t("eyebrow")}
              </p>

              <ContactSheetMissingFrame />

              <div className="grid max-w-2xl gap-6">
                <h1 className="text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
                  {t("title")}
                </h1>
                <p className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  {t("subtitle")}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
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
            </div>
          </FadeIn>
        </div>
      </section>

      {readyProjects.length > 0 ? (
        <section className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("archiveEyebrow")}
            title={t("archiveTitle")}
          />
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

/**
 * Contact-sheet visualisation. The 404'd page is rendered as the
 * rejected frame on a photographer's contact strip — flanked by two
 * partial neighbour frames that bleed off-canvas (signalling "this is
 * a strip you fell through") and crossed out with a hand-drawn-feeling
 * `--signal` china-marker X. The "404" sits in the empty slot in
 * `font-pixel`, which auto-swaps to the display stack on CJK contexts
 * via the `:lang(zh)` guard in `globals.css`.
 */
function ContactSheetMissingFrame() {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="relative w-full max-w-2xl"
    >
      {/* Neighbour 03 — bleeds off the left edge on md+, hidden below. */}
      <NeighbourFrame side="left" index="03" />
      {/* Neighbour 05 — symmetric on the right. */}
      <NeighbourFrame side="right" index="05" />

      {/* The missing frame. Dashed ring border, slightly recessed
       * background, oversized pixel "404" centered behind the X-mark.
       * The frame number (04) sits in the corner like a sprocket index
       * on real 35mm contact sheets. */}
      <div className="relative aspect-[5/4] overflow-hidden rounded-[1.25rem] border-2 border-dashed border-ring/55 bg-card/40 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        {/* Faint diagonal texture so the empty slot doesn't read as a
         * blank box — closer to the toned paper of a photo contact
         * sheet. */}
        <div className="bento-diag absolute inset-0 opacity-30" />

        {/* Sprocket index */}
        <div className="absolute left-4 top-4 flex items-baseline gap-1.5">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
            frame
          </span>
          <span className="font-pixel text-base leading-none text-foreground/75 tabular-nums">
            04
          </span>
        </div>

        {/* Corner registration marks (tiny crosshairs at each corner) —
         * the kind of fiducial you'd see on a real contact sheet,
         * earning the metaphor with one extra detail. */}
        <RegistrationMark className="absolute right-3 top-3" />
        <RegistrationMark className="absolute left-3 bottom-3" />
        <RegistrationMark className="absolute right-3 bottom-3" />

        {/* The oversized 404 numeral — sits behind the X so the X
         * reads as drawn over the printed frame. */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="font-pixel text-[clamp(6rem,18vw,12rem)] leading-none tabular-nums text-foreground/40">
            404
          </span>
        </span>

        {/* China-marker X-mark — two SVG strokes in --signal red with
         * a slight rotation so it reads hand-drawn rather than CAD'd. */}
        <svg
          viewBox="0 0 200 160"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <g
            stroke="var(--signal)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.92"
            style={{ transformOrigin: "100px 80px", transform: "rotate(-1.2deg)" }}
          >
            <line x1="22" y1="22" x2="178" y2="138" />
            <line x1="178" y1="22" x2="22" y2="138" />
          </g>
        </svg>

        {/* Editor's stamp — bottom-right corner, mono uppercase. The
         * china-marker X is the primary "REJECTED" signal; this
         * typographic stamp confirms the intent without yelling. */}
        <div className="absolute bottom-3 left-3">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-signal/75">
            kill
          </span>
        </div>
      </div>
    </div>
  );
}

function NeighbourFrame({
  side,
  index,
}: {
  side: "left" | "right";
  index: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute top-1/2 hidden h-[68%] w-[22%] -translate-y-1/2 overflow-hidden rounded-[1rem] border border-border/60 bg-card/40 shadow-[0_18px_50px_rgba(0,0,0,0.12)] md:block",
        side === "left" ? "-left-[18%]" : "-right-[18%]",
      )}
    >
      <div className="bento-diag absolute inset-0 opacity-25" />
      <div
        className={cn(
          "absolute top-3 flex items-baseline gap-1",
          side === "left" ? "left-3" : "right-3",
        )}
      >
        <span className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-muted-foreground/80">
          frm
        </span>
        <span className="font-pixel text-sm leading-none text-muted-foreground tabular-nums">
          {index}
        </span>
      </div>
    </div>
  );
}

function RegistrationMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block size-2 opacity-50",
        "before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-muted-foreground",
        "after:absolute after:top-1/2 after:left-0 after:h-px after:w-full after:-translate-y-1/2 after:bg-muted-foreground",
        "relative",
        className,
      )}
    />
  );
}
