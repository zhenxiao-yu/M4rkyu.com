"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Resource } from "@/content/schemas";
import { cn, FOCUS_RING } from "@/lib/utils";
import { ToolIcon } from "./tool-icon";

interface ToolCardProps {
  resource: Resource;
  locale: Locale;
  /** Dense mode trims the description to a single line for compact rails. */
  dense?: boolean;
  className?: string;
}

export function ToolCard({ resource, locale, dense, className }: ToolCardProps) {
  const t = useTranslations("Resources");
  return (
    <Link
      href={`/resources/${resource.slug}`}
      locale={locale}
      aria-label={t("openToolAria", { name: resource.name })}
      className={cn(
        "group relative isolate flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card/80 p-4 transition-[border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:border-ring/60 hover:bg-card motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
        className,
      )}
    >
      <PointerSpotlight radius={260} intensity={0.18} />
      <div className="relative z-20 flex items-start justify-between gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-md border border-border/70 bg-background/60 text-ring transition-colors group-hover:border-ring/50"
        >
          <ToolIcon iconKey={resource.iconKey} tags={resource.tags} className="size-4.5" />
        </span>
        <Badge variant="success" className="gap-1 font-mono text-[0.55rem] uppercase tracking-[0.18em]">
          <Play aria-hidden="true" className="size-2.5 fill-current" />
          {t("type.tool")}
        </Badge>
      </div>
      <div className="relative z-20 grid gap-1.5">
        <h3 className="text-base font-semibold leading-tight">{resource.name}</h3>
        <p
          className={cn(
            "text-sm leading-6 text-muted-foreground",
            dense ? "line-clamp-1" : "line-clamp-2",
          )}
        >
          {resource.description}
        </p>
      </div>
      <div className="relative z-20 mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono text-[0.55rem]">
              {tag}
            </Badge>
          ))}
        </div>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
        />
      </div>
    </Link>
  );
}
