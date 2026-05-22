import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Frosted-glass surface (the "glass over cyber" language). Swaps the
   * opaque `border bg-card shadow-sm` treatment for the `.glass-surface`
   * utility — translucent fill, backdrop blur, hairline ring + sheen in
   * box-shadow. Add `glass-interactive` via `className` for the hover
   * lift. Defaults off so existing cards are unchanged.
   */
  glass?: boolean;
};

export function Card({ className, glass = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg text-card-foreground transition-[border-color,box-shadow,transform] duration-(--motion-fast) ease-(--ease-premium)",
        glass ? "glass-surface" : "border bg-card shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
  );
}

type CardTitleTag = "h2" | "h3" | "h4";
type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Heading level. Defaults to `h3`; promote to `h2` when the card sits
   * directly under the page H1 so the document outline stays sequential. */
  as?: CardTitleTag;
};

export function CardTitle({
  className,
  as: Tag = "h3",
  ...props
}: CardTitleProps) {
  return (
    <Tag
      className={cn(
        "text-lg font-semibold leading-none tracking-normal",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center p-5 pt-0", className)} {...props} />
  );
}
