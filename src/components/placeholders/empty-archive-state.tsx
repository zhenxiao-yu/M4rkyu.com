import { ArchiveX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyArchiveState({
  title = "Archive lane empty",
  description = "Draft: items for this lane are coming soon.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="grid place-items-center px-6 py-14 text-center">
        <ArchiveX className="size-9 text-muted-foreground" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-semibold">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        <Button variant="outline" className="mt-6" disabled>
          Replace with final content
        </Button>
      </CardContent>
    </Card>
  );
}
