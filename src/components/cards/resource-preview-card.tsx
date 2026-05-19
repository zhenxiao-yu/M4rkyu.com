import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Resource } from "@/content/schemas";

interface ResourcePreviewCardProps {
  resource: Resource;
}

const monoEyebrow =
  "font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground";

export function ResourcePreviewCard({ resource }: ResourcePreviewCardProps) {
  const isDraft = resource.status !== "ready";

  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${resource.name} — opens in a new tab`}
      className={cn(
        "group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition duration-(--motion-fast) ease-(--ease-premium) hover:-translate-y-0.5 hover:border-ring/50 hover:shadow-md hover:shadow-ring/5",
        FOCUS_RING,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={monoEyebrow}>{resource.category}</span>
          {isDraft ? <DraftBadge label={resource.status} /> : null}
        </div>
        <Badge
          variant="outline"
          className="shrink-0 text-[0.6rem] tracking-[0.16em]"
        >
          {resource.pricing}
        </Badge>
      </header>

      <h3 className="text-base font-semibold leading-snug">{resource.name}</h3>

      <p className="text-sm leading-6 text-muted-foreground line-clamp-2">
        {resource.why}
      </p>

      <div className="mt-auto flex items-end justify-end pt-2">
        <ExternalLink
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-colors duration-(--motion-fast) group-hover:text-foreground"
        />
      </div>
    </a>
  );
}
