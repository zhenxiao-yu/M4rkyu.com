"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Resource } from "@/content/schemas";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { ToolIcon } from "./tool-icon";

interface ToolListRowProps {
  resource: Resource;
  locale: Locale;
}

export function ToolListRow({ resource, locale }: ToolListRowProps) {
  const t = useTranslations("Resources");
  return (
    <Link
      href={`/resources/${resource.slug}`}
      locale={locale}
      aria-label={t("openToolAria", { name: resource.name })}
      className={cn(
        "group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 transition-[background-color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:border-border hover:bg-muted/50",
        FOCUS_RING_INSET,
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border/70 bg-card/60 text-ring">
        <ToolIcon iconKey={resource.iconKey} tags={resource.tags} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {resource.name}
        </span>
        <span className="hidden truncate text-xs text-muted-foreground sm:block">
          {resource.description}
        </span>
      </span>
      <span className="hidden flex-wrap gap-1 md:flex">
        {resource.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="font-mono text-[0.55rem]">
            {tag}
          </Badge>
        ))}
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
      />
    </Link>
  );
}
