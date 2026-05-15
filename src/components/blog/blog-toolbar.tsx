"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BlogViewMode } from "./use-view-mode";

interface TagEntry {
  tag: string;
  count: number;
}

interface BlogToolbarProps {
  /** Query string controlled by the parent (URL-synced). */
  query: string;
  /** Setter — receives the raw input value. */
  onQueryChange: (value: string) => void;
  /** All known tags ordered by frequency (most-used first). */
  rankedTags: TagEntry[];
  /** Currently active tag, or `null` for "All". */
  activeTag: string | null;
  /** Setter — `null` clears the filter. */
  onTagChange: (tag: string | null) => void;
  /** Visible-count display: "n / total". */
  filteredCount: number;
  totalCount: number;
  /** Persisted view-mode (list vs grid). */
  viewMode: BlogViewMode;
  onViewModeChange: (mode: BlogViewMode) => void;
}

const TOP_N = 6;

/**
 * Search + tag filter strip for /blog. Top-`TOP_N` tags render
 * inline as Badge buttons; the remainder collapse behind a "More"
 * dropdown that dismisses on click-outside and Escape. URL state is
 * owned by the parent (`BlogTimeline`) so reload restores both
 * `?q=` and `?tag=`.
 */
export function BlogToolbar({
  query,
  onQueryChange,
  rankedTags,
  activeTag,
  onTagChange,
  filteredCount,
  totalCount,
  viewMode,
  onViewModeChange,
}: BlogToolbarProps) {
  const t = useTranslations("Blog");
  const searchId = useId();
  const moreId = useId();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const topTags = rankedTags.slice(0, TOP_N);
  const restTags = rankedTags.slice(TOP_N);
  const activeInRest =
    activeTag !== null && restTags.some((entry) => entry.tag === activeTag);

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
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="flex flex-wrap items-center gap-2">
        <TagChip
          active={activeTag === null}
          onClick={() => onTagChange(null)}
          label={t("tagAll")}
        />
        {topTags.map(({ tag }) => (
          <TagChip
            key={tag}
            active={activeTag === tag}
            onClick={() => onTagChange(tag)}
            label={tag}
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
              aria-label={t("tagMoreOpen")}
              onClick={() => setMoreOpen((value) => !value)}
            >
              <Badge
                variant={activeInRest ? "success" : "outline"}
                className={cn(
                  "cursor-pointer transition-[color,border-color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
                  !activeInRest &&
                    "hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {t("tagMore")} +{restTags.length}
              </Badge>
            </Button>
            {moreOpen ? (
              <div
                id={moreId}
                role="group"
                className="absolute left-0 top-full z-20 mt-2 flex max-h-72 w-64 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-border bg-popover p-3 shadow-md"
              >
                {restTags.map(({ tag, count }) => (
                  <TagChip
                    key={tag}
                    active={activeTag === tag}
                    onClick={() => {
                      onTagChange(tag);
                      setMoreOpen(false);
                    }}
                    label={
                      <>
                        <span>{tag}</span>
                        <span className="font-mono text-[0.55rem] text-muted-foreground">
                          {count}
                        </span>
                      </>
                    }
                    extraBadgeClass="gap-1.5"
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          {filteredCount} / {totalCount}
        </span>
      </div>

      <div className="flex items-center gap-2 lg:justify-end">
        <ViewModeToggle
          value={viewMode}
          onChange={onViewModeChange}
          label={t("viewModeLabel")}
          listLabel={t("viewModeList")}
          gridLabel={t("viewModeGrid")}
        />
        <label htmlFor={searchId} className="block flex-1 lg:flex-initial">
          <span className="sr-only">{t("searchLabel")}</span>
          <span className="relative block lg:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={searchId}
            type="search"
            autoComplete="off"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="pl-9 pr-9"
          />
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={t("clearSearch")}
              className="absolute right-1 top-1/2 size-7 -translate-y-1/2 rounded-sm p-0 hover:bg-muted"
              onClick={() => onQueryChange("")}
            >
              <X aria-hidden="true" className="size-3.5" />
            </Button>
          ) : null}
          </span>
        </label>
      </div>
    </div>
  );
}

/**
 * Three-state segmented toggle: List ↔ Grid. Persists via the parent
 * (which owns `useViewMode`). Hidden below `sm` because mobile only
 * has room for the list layout regardless of preference.
 */
function ViewModeToggle({
  value,
  onChange,
  label,
  listLabel,
  gridLabel,
}: {
  value: BlogViewMode;
  onChange: (next: BlogViewMode) => void;
  label: string;
  listLabel: string;
  gridLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="hidden items-center gap-0.5 rounded-md border border-border bg-muted/30 p-0.5 sm:flex"
    >
      <ToggleButton
        active={value === "list"}
        onClick={() => onChange("list")}
        aria-label={listLabel}
      >
        <List aria-hidden="true" className="size-3.5" />
      </ToggleButton>
      <ToggleButton
        active={value === "grid"}
        onClick={() => onChange("grid")}
        aria-label={gridLabel}
      >
        <LayoutGrid aria-hidden="true" className="size-3.5" />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
  ...rest
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "grid size-7 place-items-center rounded-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Single filter chip used by both the inline tag rail and the
 * "More" dropdown. Centralising avoids the focus-ring + hover-state
 * drift that crept in across the three previous inline copies.
 */
function TagChip({
  active,
  onClick,
  label,
  extraBadgeClass,
}: {
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
  extraBadgeClass?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      // rounded-full so the focus ring traces the chip shape; ring-
      // offset tightened to 1 so the ring doesn't visually detach.
      className="h-auto rounded-full p-0 hover:bg-transparent focus-visible:ring-offset-1"
      aria-pressed={active}
      onClick={onClick}
    >
      <Badge
        variant={active ? "success" : "outline"}
        className={cn(
          "cursor-pointer transition-[color,border-color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
          !active && "hover:border-foreground/40 hover:text-foreground",
          extraBadgeClass,
        )}
      >
        {label}
      </Badge>
    </Button>
  );
}
