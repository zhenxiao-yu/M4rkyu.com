"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn, FOCUS_RING } from "@/lib/utils";

export interface SpecRailSection {
  id: string;
  label: string;
}

export interface SpecFact {
  label: string;
  value: string;
}

interface SpecRailProps {
  sections: SpecRailSection[];
  facts: SpecFact[];
  liveUrl?: string;
  githubUrl?: string;
  labels: { onThisPage: string; spec: string; live: string; source: string };
}

/**
 * Sticky "spec sheet" + on-this-page nav for /work/[slug]. Scroll-spy
 * highlights the section currently in view; clicking a TOC entry smooth-scrolls
 * (instant under reduced motion). On mobile it renders inline as a top panel
 * (the `lg:sticky` only engages at the two-column breakpoint).
 */
export function SpecRail({
  sections,
  facts,
  liveUrl,
  githubUrl,
  labels,
}: SpecRailProps) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // Bias the active band toward the top third of the viewport.
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const handleJump = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    setActiveId(id);
    // Keep the URL hash in sync without a jump.
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-lg border border-border bg-card/60 p-5">
        {/* Spec sheet */}
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {labels.spec}
        </p>
        <dl className="mt-4 grid gap-3">
          {facts.map((fact) => (
            <div key={fact.label} className="grid gap-0.5">
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="text-sm leading-6 text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {liveUrl || githubUrl ? (
          <div className="mt-5 flex flex-col gap-2">
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-primary/90",
                  FOCUS_RING,
                )}
              >
                {labels.live}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
            ) : null}
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
                  FOCUS_RING,
                )}
              >
                {labels.source}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* On this page — TOC with scroll-spy */}
      {sections.length > 0 ? (
        <nav
          aria-label={labels.onThisPage}
          className="mt-5 hidden rounded-lg border border-border bg-card/40 p-5 lg:block"
        >
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {labels.onThisPage}
          </p>
          <ul className="mt-3 grid gap-1">
            {sections.map((section) => {
              const isActive = section.id === activeId;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => handleJump(event, section.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      FOCUS_RING,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "font-mono text-xs transition-opacity duration-(--motion-fast)",
                        isActive
                          ? "text-ring opacity-100"
                          : "opacity-0 group-hover:opacity-60",
                      )}
                    >
                      &gt;
                    </span>
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </aside>
  );
}
