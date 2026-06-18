"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { scrollSpine } from "@/lib/home-spine";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Hero "scroll on" affordance — a mono label over a bouncing chevron that
 * jumps to the next home section. Pure button, so keyboard + touch get it
 * for free; the bounce is motion-safe.
 */
export function HeroScrollCue({ className }: { className?: string }) {
  const t = useTranslations("Home");

  return (
    <button
      type="button"
      onClick={() => scrollSpine(1)}
      aria-label={t("scrollNextAria")}
      className={cn(
        "group inline-flex flex-col items-center gap-1.5 rounded-full p-1",
        FOCUS_RING,
        className,
      )}
    >
      <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-foreground">
        {t("scrollNext")}
      </span>
      <span className="grid size-8 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground backdrop-blur-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/50 group-hover:text-foreground">
        <ChevronDown
          aria-hidden="true"
          className="size-4 motion-safe:animate-bounce"
        />
      </span>
    </button>
  );
}
