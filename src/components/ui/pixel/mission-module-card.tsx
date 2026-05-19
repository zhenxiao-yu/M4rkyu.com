import * as React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SystemBadge } from "./system-badge";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/content/localize";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/content/schemas";

interface MissionModuleCardProps {
  project: Project;
  locale: Locale;
  /**
   * Wraps the card with a BorderBeam highlight. Use sparingly — no more
   * than one beam in view at once per docs/UI_LIBRARY_STRATEGY.md §9.
   */
  highlighted?: boolean;
  /** Drops the pitch paragraph for tighter list layouts. */
  compact?: boolean;
}

// Cartridge corner notch (top-right). `sm:` only — hidden below `sm` to
// avoid awkward clipping when the card collapses to full width.
const NOTCH_CLASS =
  "sm:[clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]";

export async function MissionModuleCard({
  project,
  locale,
  highlighted = false,
  compact = false,
}: MissionModuleCardProps) {
  const tProjects = await getTranslations({ locale, namespace: "Projects" });
  const tStatus = await getTranslations({ locale, namespace: "Status" });
  const localized = localize(project, locale);
  const cover = project.screenshots[0];
  const stackDisplay =
    project.stack.length > 5
      ? [...project.stack.slice(0, 4), `+${project.stack.length - 4}`]
      : project.stack;

  return (
    <div className="relative h-full">
      {highlighted ? <BorderBeam duration={14} borderRadius={8} /> : null}
      <Link
        href={`/work/${project.slug}`}
        locale={locale}
        aria-label={localized.title as string}
        className={cn("group block h-full rounded-lg", FOCUS_RING)}
      >
        <Card
          className={cn(
            "relative h-full overflow-hidden bg-card/80 transition duration-(--motion-medium) ease-(--ease-premium) group-hover:-translate-y-1 group-hover:border-ring/40 group-hover:shadow-lg group-hover:shadow-ring/5",
            NOTCH_CLASS,
          )}
        >
          {/* Cartridge spine — 4px top bar that brightens on hover. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-muted transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:bg-ring/60"
          />
          <div className="relative aspect-16/10 overflow-hidden border-b bg-muted">
            {cover ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover grayscale transition duration-300 group-hover:scale-[1.03] group-hover:grayscale-0"
              />
            ) : (
              <PlaceholderImage
                label={tProjects("mediaTbd")}
                aspect="h-full"
                className="rounded-none border-0"
              />
            )}
          </div>
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <SystemBadge
                status={project.contentStatus}
                label={tStatus(project.contentStatus)}
              />
              <span className="font-mono text-xs text-muted-foreground">
                {project.year}
              </span>
            </div>
            <h3 className="text-base font-semibold leading-snug text-foreground">
              <span className="inline-flex items-baseline gap-1">
                {localized.title as string}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 self-center opacity-50 transition duration-(--motion-fast) ease-(--ease-premium) group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </span>
            </h3>
            {compact ? null : (
              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                {localized.shortPitch as string}
              </p>
            )}
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {stackDisplay.map((item) => (
                <li key={item}>
                  <Badge variant="outline" className="text-[0.65rem]">
                    {item}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Link>
    </div>
  );
}
