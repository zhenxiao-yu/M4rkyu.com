import type { ReactNode } from "react";

/**
 * Lightweight in-shell page header — replaces the public PageHero across the
 * admin subtree. Calm and content-first (no hero atmospherics): eyebrow,
 * title, description, and an optional right-aligned actions slot (back links,
 * "view on site", etc.).
 */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-border/60 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
