"use client";

import { BlurFade } from "@/components/ui/magic/blur-fade";
import { Badge } from "@/components/ui/badge";
import type { Resource } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { ToolCard } from "./tool-card";
import { ToolListRow } from "./tool-list-row";

interface TagSectionProps {
  /** Primary tag slug (e.g. "css"). */
  tagSlug: string;
  label: string;
  /** Optional one-line lede shown under the title. */
  lede?: string;
  tools: Resource[];
  locale: Locale;
  viewMode: "grid" | "list";
}

// Labeled section rail per primary tag. A tool may appear in more than
// one section (membership is tag-based, not exclusive) — that's the
// intended UX since tags double as discoverability paths.
export function TagSection({
  tagSlug,
  label,
  lede,
  tools,
  locale,
  viewMode,
}: TagSectionProps) {
  if (tools.length === 0) return null;
  return (
    <BlurFade delay={0.04}>
      <section
        id={`tag-${tagSlug}`}
        aria-labelledby={`tag-${tagSlug}-heading`}
        className="grid gap-4"
      >
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3">
            <h2
              id={`tag-${tagSlug}-heading`}
              className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground"
            >
              # {label}
            </h2>
            <Badge variant="outline" className="font-mono text-[0.55rem]">
              {tools.length}
            </Badge>
          </div>
          {lede ? (
            <p className="text-xs text-muted-foreground">{lede}</p>
          ) : null}
        </header>
        {viewMode === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} resource={tool} locale={locale} />
            ))}
          </div>
        ) : (
          <ul className="grid gap-1 rounded-lg border border-border bg-card/40 p-1.5">
            {tools.map((tool) => (
              <li key={tool.slug}>
                <ToolListRow resource={tool} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlurFade>
  );
}
