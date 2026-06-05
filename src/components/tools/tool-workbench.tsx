"use client";

import { useCallback, useEffect, useState } from "react";
import { Command as CommandIcon, CornerDownLeft } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/navigation";
import { rankCommand } from "@/lib/search/rank";
import { cn, FOCUS_RING } from "@/lib/utils";

export interface WorkbenchTool {
  slug: string;
  name: string;
  tag: string;
}

interface ToolWorkbenchProps {
  tools: WorkbenchTool[];
  currentSlug: string;
  prevSlug: string | null;
  nextSlug: string | null;
  labels: {
    jump: string;
    jumpTitle: string;
    jumpPlaceholder: string;
    jumpEmpty: string;
  };
}

/**
 * Interactive bits of the tool "workbench": a tools-scoped jump switcher
 * (a cmdk dialog over the full catalog, deliberately separate from the
 * global ⌘K palette) plus `[` / `]` keyboard browsing between adjacent
 * tools. Rendered as a small island inside the (server) ToolShell.
 */
export function ToolWorkbench({
  tools,
  currentSlug,
  prevSlug,
  nextSlug,
  labels,
}: ToolWorkbenchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const goTo = useCallback(
    (slug: string) => router.push(`/resources/${slug}`),
    [router],
  );

  // `[` / `]` step through the catalog. Guarded so it never fires while
  // the visitor is typing in a tool's input or a dialog is open — these
  // tools are full of text fields.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      if (open) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el?.isContentEditable
      ) {
        return;
      }
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;

      if (e.key === "[" && prevSlug) {
        e.preventDefault();
        goTo(prevSlug);
      } else if (e.key === "]" && nextSlug) {
        e.preventDefault();
        goTo(nextSlug);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prevSlug, nextSlug, goTo]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground",
          FOCUS_RING,
        )}
      >
        <CommandIcon aria-hidden="true" className="size-3" />
        {labels.jump}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideCloseButton
          className="flex flex-col gap-0 overflow-hidden p-0 md:max-w-xl md:max-h-[min(70dvh,32rem)]"
        >
          <VisuallyHidden>
            <DialogTitle>{labels.jumpTitle}</DialogTitle>
            <DialogDescription>{labels.jumpPlaceholder}</DialogDescription>
          </VisuallyHidden>

          <Command
            label={labels.jumpTitle}
            filter={(value, search) => rankCommand(value, search)}
            className="flex min-h-0 flex-1 flex-col rounded-md"
          >
            <CommandInput
              placeholder={labels.jumpPlaceholder}
              className="h-11"
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {labels.jumpEmpty}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {tools.map((tool) => (
                  <CommandItem
                    key={tool.slug}
                    value={`${tool.name} ${tool.tag} ${tool.slug}`}
                    data-current={tool.slug === currentSlug ? "" : undefined}
                    onSelect={() => {
                      setOpen(false);
                      goTo(tool.slug);
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        tool.slug === currentSlug ? "bg-ring" : "bg-border",
                      )}
                    />
                    <span className="truncate">{tool.name}</span>
                    <span
                      aria-hidden="true"
                      className="ml-auto shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70"
                    >
                      {tool.tag}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="hidden shrink-0 items-center gap-3 border-t px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground md:flex">
              <span className="inline-flex items-center gap-1.5">
                <kbd className="rounded border bg-background px-1.5 py-0.5">
                  ↑↓
                </kbd>
                move
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CornerDownLeft aria-hidden="true" className="size-3" />
                open
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5">
                <kbd className="rounded border bg-background px-1.5 py-0.5">
                  [ ]
                </kbd>
                prev / next
              </span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
