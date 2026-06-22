import type { ReactNode } from "react";
import { ArchiveX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/magic/blur-fade";

export function EmptyArchiveState({
  title = "Archive lane empty",
  description = "Items for this lane are coming soon.",
  action,
}: {
  title?: string;
  description?: string;
  /** Optional CTA (e.g. <Link>Browse all</Link>). Renders below the body. */
  action?: ReactNode;
}) {
  return (
    <BlurFade>
      <Card className="relative overflow-hidden border-dashed bg-muted/20">
        {/* Faint cyber-grid ties the empty panel to the site's HUD language
          * instead of reading as a generic blank card. Decorative + inert. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-[0.04]"
        />
        <CardContent className="relative grid place-items-center px-6 py-16 text-center">
          {/* Accent-rimmed instrument frame — mirrors the colophon module
            * icons so empty states share the editorial-HUD vocabulary. */}
          <div
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-md border border-ring/40 bg-background/70 text-ring"
          >
            <ArchiveX className="size-5" />
          </div>
          <h3 className="mt-5 font-heading text-xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          {action ? <div className="mt-6">{action}</div> : null}
        </CardContent>
      </Card>
    </BlurFade>
  );
}
