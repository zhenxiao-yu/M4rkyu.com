"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ExternalLink, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import type { Resource } from "@/content/schemas";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import { ToolIcon } from "./tool-icon";
import { ToolViewModeToggle } from "./tool-view-mode-toggle";
import { useToolViewMode } from "./use-tool-view-mode";

const TOP_TAG_COUNT = 8;

// Independent storage key so the links page remembers its own grid /
// list preference apart from the tools page.
const LINKS_VIEW_KEY = "m4rkyu:resources:links-view-mode";
const LINKS_VIEW_EVENT = "m4rkyu:resources-links-view-mode-changed";

interface LinksExplorerProps {
  links: Resource[];
}

export function LinksExplorer({ links }: LinksExplorerProps) {
  const t = useTranslations("Resources");
  const [viewMode, setViewMode] = useToolViewMode({
    storageKey: LINKS_VIEW_KEY,
    storageEvent: LINKS_VIEW_EVENT,
  });
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Top tags by frequency across the link set — the pill row stays
  // short and meaningful instead of exploding into a tag cloud.
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const link of links) {
      for (const tag of link.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, TOP_TAG_COUNT);
  }, [links]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return links.filter((link) => {
      const matchesTag = activeTag ? link.tags.includes(activeTag) : true;
      const matchesQuery = normalizedQuery
        ? [link.name, link.description, link.why, ...link.tags]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      return matchesTag && matchesQuery;
    });
  }, [links, activeTag, query]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.name.localeCompare(b.name)),
    [filtered],
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("subCategoryLabel")}
          </span>
          <FilterPill
            label={t("tagSection.all")}
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
            count={links.length}
          />
          {topTags.map(([tag, count]) => (
            <FilterPill
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              count={count}
            />
          ))}
          <span className="ml-1 font-mono text-xs text-muted-foreground">
            {t("linkCount", { count: filtered.length })}
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-3 sm:flex-nowrap sm:items-center">
          <label className="grid flex-1 gap-1.5 text-xs text-muted-foreground">
            <span className="sr-only">{t("LinksPage.searchLabel")}</span>
            <span className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              />
              <Input
                className="pl-9"
                name="link-search"
                autoComplete="off"
                aria-label={t("LinksPage.searchLabel")}
                placeholder={t("LinksPage.searchPlaceholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </span>
          </label>
          <ToolViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            label={t("viewToggleLabel")}
            listLabel={t("viewToggleList")}
            gridLabel={t("viewToggleGrid")}
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="grid gap-3">
          <EmptyArchiveState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
          {query || activeTag ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setActiveTag(null);
                }}
              >
                {t("clearFilters")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : viewMode === "grid" ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((link) => (
            <li key={link.slug}>
              <LinkCard resource={link} visitLabel={t("visit")} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-1 rounded-lg border border-border bg-card/40 p-1.5">
          {sorted.map((link) => (
            <li key={link.slug}>
              <LinkListRow resource={link} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="h-auto p-0 hover:bg-transparent"
      aria-pressed={active}
    >
      <Badge
        variant={active ? "success" : "outline"}
        className="gap-1 cursor-pointer transition-[color,border-color,background-color] duration-(--motion-fast) ease-(--ease-premium)"
      >
        {label}
        <span className="font-mono text-[0.55rem] opacity-70">{count}</span>
      </Badge>
    </Button>
  );
}

function LinkCard({
  resource,
  visitLabel,
}: {
  resource: Resource;
  visitLabel: string;
}) {
  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${visitLabel} — ${resource.name}`}
      className={cn(
        "group relative flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card/80 p-4 transition-[border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:border-ring/60 hover:bg-card motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border/70 bg-background/60 text-ring transition-colors group-hover:border-ring/50">
          <ToolIcon
            iconKey={resource.iconKey}
            tags={resource.tags}
            className="size-4.5"
          />
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline" className="font-mono text-[0.55rem]">
            {resource.pricing}
          </Badge>
        </div>
      </div>
      <div className="grid gap-1.5">
        <h3 className="text-base font-semibold leading-tight">
          {resource.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {resource.description}
        </p>
        {resource.why ? (
          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground/80">
            {resource.why}
          </p>
        ) : null}
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="font-mono text-[0.55rem]"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <ExternalLink
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
        />
      </div>
    </a>
  );
}

function LinkListRow({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={resource.name}
      className={cn(
        "group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 transition-[background-color,border-color] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:border-border hover:bg-muted/50",
        FOCUS_RING_INSET,
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border/70 bg-card/60 text-ring">
        <ToolIcon
          iconKey={resource.iconKey}
          tags={resource.tags}
          className="size-4"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {resource.name}
        </span>
        <span className="hidden truncate text-xs text-muted-foreground sm:block">
          {resource.description}
        </span>
      </span>
      <span className="hidden flex-wrap gap-1 md:flex">
        {resource.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="font-mono text-[0.55rem]"
          >
            {tag}
          </Badge>
        ))}
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
      />
    </a>
  );
}
