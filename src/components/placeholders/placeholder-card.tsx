import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftBadge } from "./draft-badge";
import { PlaceholderImage } from "./placeholder-image";

export function PlaceholderCard({
  title = "Draft archive item",
  description = "Placeholder: replace with final content.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="overflow-hidden bg-card/80">
      <PlaceholderImage label="THUMBNAIL TBD" aspect="aspect-4/3" className="rounded-none border-0 border-b" />
      <CardHeader>
        <DraftBadge label="Placeholder" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}
