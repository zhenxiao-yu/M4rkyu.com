import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolShellProps {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

// Shared wrapper around every /resources/[slug] tool. Keeps title /
// description / category presentation consistent so each tool only
// ships its actual interactive surface.
export function ToolShell({
  title,
  description,
  category,
  tags,
  actions,
  children,
  className,
}: ToolShellProps) {
  return (
    <div className={cn("grid gap-5", className)}>
      <header className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {category ? <Badge variant="outline">{category}</Badge> : null}
          {tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono text-[0.6rem]">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div>
        ) : null}
      </header>
      <Card className="bg-card/80">
        <CardHeader className="border-b border-border/60 py-3">
          <CardTitle className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            tool
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-7">{children}</CardContent>
      </Card>
    </div>
  );
}
