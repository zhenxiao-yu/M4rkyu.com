"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Resource } from "@/content/schemas";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { ToolIcon } from "./tool-icon";

interface ToolsMarqueeProps {
  tools: Resource[];
  locale: Locale;
}

// Full-bleed auto-scrolling chip strip. Pure CSS keyframes; no JS
// animation lifecycle. Pauses on hover via group-hover state.
// `prefers-reduced-motion` renders a static wrap of the same chips
// instead of an empty container.
export function ToolsMarquee({ tools, locale }: ToolsMarqueeProps) {
  const t = useTranslations("Resources");
  const reduceMotion = useReducedMotion();
  if (tools.length === 0) return null;

  if (reduceMotion) {
    return (
      <nav
        aria-label={t("marqueeLabel")}
        className="flex flex-wrap gap-2 border-y border-border/60 bg-card/30 px-4 py-4"
      >
        {tools.map((tool) => (
          <Chip key={tool.slug} resource={tool} locale={locale} ariaLabel={t("openToolAria", { name: tool.name })} />
        ))}
      </nav>
    );
  }

  // Duplicate the strip so the loop reads as continuous. aria-hidden on
  // the clone keeps screen readers from announcing each tool twice.
  return (
    <nav
      aria-label={t("marqueeLabel")}
      className="group relative overflow-hidden border-y border-border/60 bg-card/30 py-4"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent"
      />
      <div className="flex w-max gap-3 motion-safe:animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]">
        <MarqueeTrack tools={tools} locale={locale} t={t} />
        <div aria-hidden="true" className="flex gap-3">
          <MarqueeTrack tools={tools} locale={locale} t={t} hideFromAria />
        </div>
      </div>
    </nav>
  );
}

function MarqueeTrack({
  tools,
  locale,
  t,
  hideFromAria,
}: {
  tools: Resource[];
  locale: Locale;
  t: ReturnType<typeof useTranslations<"Resources">>;
  hideFromAria?: boolean;
}) {
  return (
    <div className="flex shrink-0 gap-3 pr-3" aria-hidden={hideFromAria}>
      {tools.map((tool) => (
        <Chip
          key={tool.slug}
          resource={tool}
          locale={locale}
          ariaLabel={t("openToolAria", { name: tool.name })}
          tabIndex={hideFromAria ? -1 : 0}
        />
      ))}
    </div>
  );
}

function Chip({
  resource,
  locale,
  ariaLabel,
  tabIndex,
}: {
  resource: Resource;
  locale: Locale;
  ariaLabel: string;
  tabIndex?: number;
}) {
  return (
    <Link
      href={`/resources/${resource.slug}`}
      locale={locale}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium)",
        "hover:border-ring/60 hover:text-foreground",
        FOCUS_RING_INSET,
      )}
    >
      <ToolIcon iconKey={resource.iconKey} tags={resource.tags} className="size-3.5" />
      <span className="whitespace-nowrap">{resource.name}</span>
    </Link>
  );
}
