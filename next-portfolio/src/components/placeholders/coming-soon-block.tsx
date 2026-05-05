import { Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContentPendingLabel } from "./content-pending-label";

export function ComingSoonBlock({
  title = "Coming soon",
  description = "TBD: replace this placeholder with final content.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="relative overflow-hidden bg-card/80">
      <div className="absolute inset-0 bg-cyber-grid opacity-20" aria-hidden="true" />
      <CardContent className="relative grid gap-4 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="grid size-11 place-items-center rounded-md border bg-background/70">
          <Terminal className="size-5" aria-hidden="true" />
        </span>
        <div>
          <ContentPendingLabel label="Coming soon" />
          <h3 className="mt-3 text-xl font-semibold">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
