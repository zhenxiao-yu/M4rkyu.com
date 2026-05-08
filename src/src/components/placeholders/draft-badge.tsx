import { Badge } from "@/components/ui/badge";

export function DraftBadge({ label = "Draft" }: { label?: string }) {
  return <Badge variant="warning">{label}</Badge>;
}
