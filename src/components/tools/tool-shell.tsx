import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ToolWorkbench, type WorkbenchTool } from "./tool-workbench";
import { cn, FOCUS_RING } from "@/lib/utils";

interface ToolNeighbor {
  slug: string;
  name: string;
}

interface ToolShellLabels {
  runsLocal: string;
  prev: string;
  next: string;
  allTools: string;
  jump: string;
  jumpTitle: string;
  jumpPlaceholder: string;
  jumpEmpty: string;
  keysHint: string;
}

interface ToolShellProps {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  /** Source / citation buttons. */
  actions?: ReactNode;
  /** The interactive tool. */
  children: ReactNode;
  className?: string;
  // ── Workbench wiring (optional — the page passes the full set) ──
  slug?: string;
  index?: number;
  total?: number;
  prev?: ToolNeighbor | null;
  next?: ToolNeighbor | null;
  locale?: Locale;
  /** Slim catalog for the jump switcher. */
  tools?: WorkbenchTool[];
  labels?: ToolShellLabels;
}

/**
 * The "workbench module" every /resources/[slug] tool docks into. One
 * console-framed panel: a HUD strip (catalog № · category · runs-local ·
 * jump switcher), the spec header, the blueprint-framed tool surface, and
 * a prev/next footer that lets you walk the catalog without bouncing to
 * the index. `[` / `]` step between tools (see ToolWorkbench).
 *
 * All workbench props are optional so the Storybook story (which only
 * passes title/description/tags) still renders a clean minimal frame.
 */
export function ToolShell({
  title,
  description,
  category,
  tags,
  actions,
  children,
  className,
  slug,
  index,
  total,
  prev,
  next,
  locale,
  tools,
  labels,
}: ToolShellProps) {
  const showWorkbench = Boolean(tools && locale && labels && slug);
  const showNav = Boolean(locale && labels && (prev || next));

  return (
    <div className={cn("relative", className)}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/60">
        {/* Top accent hairline — the module's "powered on" tick. */}
        <span
          aria-hidden="true"
          className="block h-px w-full bg-linear-to-r from-transparent via-ring/45 to-transparent"
        />

        {/* HUD strip — catalog index · category · status · jump. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/60 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="inline-block h-3 w-0.5 bg-ring" />
            {index && total ? (
              <span className="tabular-nums text-foreground">
                № {String(index).padStart(2, "0")}
                <span className="text-muted-foreground/50"> / {total}</span>
              </span>
            ) : null}
            {category ? (
              <>
                <span aria-hidden="true" className="text-border">
                  ·
                </span>
                <span>{category}</span>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2.5">
            {labels ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="relative flex size-1.5 items-center justify-center">
                  <span className="absolute inline-flex size-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                </span>
                {labels.runsLocal}
              </span>
            ) : null}
            {showWorkbench ? (
              <ToolWorkbench
                tools={tools!}
                currentSlug={slug!}
                prevSlug={prev?.slug ?? null}
                nextSlug={next?.slug ?? null}
                labels={{
                  jump: labels!.jump,
                  jumpTitle: labels!.jumpTitle,
                  jumpPlaceholder: labels!.jumpPlaceholder,
                  jumpEmpty: labels!.jumpEmpty,
                }}
              />
            ) : null}
          </div>
        </div>

        {/* Spec header. */}
        <header className="grid gap-3 px-4 py-6 sm:px-6 sm:py-8">
          {tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
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

        {/* Tool surface — blueprint-framed work area. */}
        <div className="relative border-t border-border/60">
          <div
            aria-hidden="true"
            className="bg-cyber-grid pointer-events-none absolute inset-0 opacity-[0.25] [mask-image:radial-gradient(ellipse_at_center,black,transparent_85%)]"
          />
          {/* Corner registration ticks. */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-3 z-10">
            <span className="absolute left-0 top-0 size-3 border-l border-t border-ring/40" />
            <span className="absolute right-0 top-0 size-3 border-r border-t border-ring/40" />
            <span className="absolute bottom-0 left-0 size-3 border-b border-l border-ring/40" />
            <span className="absolute bottom-0 right-0 size-3 border-b border-r border-ring/40" />
          </span>
          <div className="relative z-0 p-4 sm:p-7">{children}</div>
        </div>

        {/* Footer — walk the catalog. */}
        {showNav ? (
          <footer className="grid grid-cols-2 items-stretch gap-2 border-t border-border/60 p-3 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
            {prev ? (
              <Link
                href={`/resources/${prev.slug}`}
                locale={locale}
                className={cn(
                  "group flex min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/50",
                  FOCUS_RING,
                )}
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-x-0.5 group-hover:text-ring"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground/70">
                    <kbd className="mr-1 not-italic">[</kbd>
                    {labels!.prev}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {prev.name}
                  </span>
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}

            <Link
              href="/resources/tools"
              locale={locale}
              className={cn(
                "row-start-2 col-span-2 inline-flex items-center justify-center gap-1.5 self-center rounded-md border border-border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground sm:row-start-auto sm:col-span-1",
                FOCUS_RING,
              )}
            >
              <LayoutGrid aria-hidden="true" className="size-3" />
              {labels!.allTools}
            </Link>

            {next ? (
              <Link
                href={`/resources/${next.slug}`}
                locale={locale}
                className={cn(
                  "group flex min-w-0 items-center justify-end gap-2.5 rounded-md px-2 py-1.5 text-right transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/50",
                  FOCUS_RING,
                )}
              >
                <span className="flex min-w-0 flex-col items-end">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground/70">
                    {labels!.next}
                    <kbd className="ml-1 not-italic">]</kbd>
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {next.name}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:translate-x-0.5 group-hover:text-ring"
                />
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
