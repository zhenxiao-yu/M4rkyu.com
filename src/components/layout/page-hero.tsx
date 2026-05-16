import type { ReactNode } from "react";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { DotGrid } from "@/components/ui/magic/dot-grid";
import { SectionHeading } from "@/components/sections/section-heading";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  decorativeWord?: string;
  disableGlitch?: boolean;
  className?: string;
  contentClassName?: string;
  sidecarClassName?: string;
}

/**
 * Shared index-route hero. Keeps page headers aligned across work,
 * archive, logs, games, media, resources, about, and contact while
 * preserving each page's optional right rail.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  meta,
  actions,
  decorativeWord,
  disableGlitch,
  className,
  contentClassName,
  sidecarClassName,
}: PageHeroProps) {
  const hasSidecar = Boolean(children);

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b bg-background",
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-cyber-grid opacity-25"
        aria-hidden="true"
      />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <DotGrid
        className="pointer-events-none absolute inset-0 opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
        spacing={34}
        baseDotSize={1}
        hoverDotSize={3.4}
        influenceRadius={150}
        baseOpacity={0.12}
      />
      {decorativeWord ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-0.2em] hidden justify-center md:flex"
        >
          <span className="font-display text-[10rem] font-black leading-none tracking-normal text-foreground/[0.035] dark:text-foreground/[0.055] lg:text-[13rem]">
            {decorativeWord}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "relative mx-auto grid w-full max-w-7xl gap-8 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8",
          hasSidecar &&
            "lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)] lg:items-end lg:gap-12",
          contentClassName,
        )}
      >
        <BlurFade>
          <SectionHeading
            as="h1"
            eyebrow={eyebrow}
            title={title}
            description={description}
            disableGlitch={disableGlitch}
          />
          {meta || actions ? (
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              {meta ? <div className="min-w-0 flex-1">{meta}</div> : null}
              {actions ? (
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {actions}
                </div>
              ) : null}
            </div>
          ) : null}
        </BlurFade>

        {hasSidecar ? (
          <BlurFade
            delay={0.1}
            className={cn("lg:justify-self-end", sidecarClassName)}
          >
            {children}
          </BlurFade>
        ) : null}
      </div>
    </section>
  );
}
