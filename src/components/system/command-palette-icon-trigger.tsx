"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, FOCUS_RING } from "@/lib/utils";
import { useCommandPalette } from "./command-palette-provider";

// Icon-only Cmd-K trigger for compact header rail; full pill is on desktop.
export function CommandPaletteIconTrigger() {
  const { setOpen } = useCommandPalette();
  const t = useTranslations("CommandPalette");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("title")}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground",
            FOCUS_RING,
          )}
        >
          <Search aria-hidden="true" className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{t("title")}</TooltipContent>
    </Tooltip>
  );
}
