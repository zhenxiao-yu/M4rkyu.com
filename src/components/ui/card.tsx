import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

type CardTitleTag = "h2" | "h3" | "h4";
type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Heading level. Defaults to `h3`; promote to `h2` when the card sits
   * directly under the page H1 so the document outline stays sequential. */
  as?: CardTitleTag;
};

export function CardTitle({ className, as: Tag = "h3", ...props }: CardTitleProps) {
  return (
    <Tag
      className={cn("text-lg font-semibold leading-none tracking-normal", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-5 pt-0", className)} {...props} />;
}
