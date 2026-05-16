"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLOG_PAGE_SETTINGS } from "@/content/blog-page";
import type { CountEntry } from "@/lib/blog/filter-posts";
import { cn } from "@/lib/utils";

interface BlogTagRailProps {
  rankedTags: CountEntry[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  labels: {
    all: string;
    more: string;
    moreOpen: string;
  };
}

export function BlogTagRail({
  rankedTags,
  activeTag,
  onTagChange,
  labels,
}: BlogTagRailProps) {
  const moreId = useId();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const topTags = rankedTags.slice(0, BLOG_PAGE_SETTINGS.inlineTagCount);
  const restTags = rankedTags.slice(BLOG_PAGE_SETTINGS.inlineTagCount);
  const activeInRest =
    activeTag !== null && restTags.some((entry) => entry.value === activeTag);

  useEffect(() => {
    if (!moreOpen) return;

    function onPointer(event: MouseEvent | TouchEvent) {
      if (!moreRef.current) return;
      if (!moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <TagChip
        active={activeTag === null}
        onClick={() => onTagChange(null)}
        label={labels.all}
      />
      {topTags.map(({ value, count }) => (
        <TagChip
          key={value}
          active={activeTag === value}
          onClick={() => onTagChange(value)}
          label={
            <>
              <span>{value}</span>
              <span className="font-mono text-[0.55rem] text-muted-foreground">
                {count}
              </span>
            </>
          }
          extraBadgeClass="gap-1.5"
        />
      ))}
      {restTags.length > 0 ? (
        <div ref={moreRef} className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto rounded-full p-0 hover:bg-transparent focus-visible:ring-offset-1"
            aria-expanded={moreOpen}
            aria-controls={moreId}
            aria-label={labels.moreOpen}
            onClick={() => setMoreOpen((value) => !value)}
          >
            <Badge
              variant={activeInRest ? "success" : "outline"}
              className={cn(
                "cursor-pointer gap-1.5 transition-[color,border-color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
                !activeInRest &&
                  "hover:border-foreground/40 hover:text-foreground",
              )}
            >
              <span>{labels.more}</span>
              <span className="font-mono text-[0.55rem]">
                +{restTags.length}
              </span>
            </Badge>
          </Button>
          {moreOpen ? (
            <div
              id={moreId}
              role="group"
              className="absolute left-0 top-full z-30 mt-2 grid max-h-80 w-[min(22rem,calc(100vw-2rem))] grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-border bg-popover p-3 shadow-xl shadow-black/10 sm:grid-cols-2"
            >
              {restTags.map(({ value, count }) => (
                <TagChip
                  key={value}
                  active={activeTag === value}
                  onClick={() => {
                    onTagChange(value);
                    setMoreOpen(false);
                  }}
                  label={
                    <>
                      <span className="truncate">{value}</span>
                      <span className="font-mono text-[0.55rem] text-muted-foreground">
                        {count}
                      </span>
                    </>
                  }
                  extraBadgeClass="w-full justify-between gap-2"
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TagChip({
  active,
  onClick,
  label,
  extraBadgeClass,
}: {
  active: boolean;
  onClick: () => void;
  label: ReactNode;
  extraBadgeClass?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-auto max-w-full rounded-full p-0 hover:bg-transparent focus-visible:ring-offset-1"
      aria-pressed={active}
      onClick={onClick}
    >
      <Badge
        variant={active ? "success" : "outline"}
        className={cn(
          "max-w-full cursor-pointer truncate transition-[color,border-color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
          !active && "hover:border-foreground/40 hover:text-foreground",
          extraBadgeClass,
        )}
      >
        {label}
      </Badge>
    </Button>
  );
}
