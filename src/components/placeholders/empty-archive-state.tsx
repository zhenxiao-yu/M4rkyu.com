import type { ReactNode } from "react";
import { ArchiveX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="border-dashed bg-muted/30">
      <CardContent className="grid place-items-center px-6 py-14 text-center">
        <div
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full border border-border bg-background text-muted-foreground"
        >
          <ArchiveX className="size-5" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
