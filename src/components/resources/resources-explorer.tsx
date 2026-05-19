"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import type { Resource } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { TagSection } from "./tag-section";
import { ToolListRow } from "./tool-list-row";
import { ToolViewModeToggle } from "./tool-view-mode-toggle";
import { useToolViewMode } from "./use-tool-view-mode";

// Primary tag taxonomy. Drives the section rails AND the filter pills.
// Tools may belong to more than one tag — the section UI surfaces every
// matching tag, which is the intended discoverability path.
const PRIMARY_TAGS = ["css", "crypto", "text", "format", "encode"] as const;
type PrimaryTag = (typeof PRIMARY_TAGS)[number];

interface ResourcesExplorerProps {
  tools: Resource[];
  locale: Locale;
}

export function ResourcesExplorer({ tools, locale }: ResourcesExplorerProps) {
  const t = useTranslations("Resources");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [viewMode, setViewMode] = useToolViewMode();

  const tagParam = searchParams.get("tag");
  const activeTag: PrimaryTag | null =
    tagParam && (PRIMARY_TAGS as readonly string[]).includes(tagParam)
      ? (tagParam as PrimaryTag)
      : null;
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateUrl(next: { tag?: PrimaryTag | null; q?: string }) {
    const params = new URLSearchParams(searchParams);
    if ("tag" in next) {
      if (next.tag) params.set("tag", next.tag);
      else params.delete("tag");
    }
    if ("q" in next) {
      const value = next.q?.trim();
      if (value) params.set("q", value);
      else params.delete("q");
    }
    // Back-compat: silently drop stale `type` / `category` keys from PR
    // 3 so external bookmarks don't render a broken empty state.
    params.delete("type");
    params.delete("category");
    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    });
  }

  // Single canonical filter pass — the section views slice off this set,
  // so a tool that lives in two tags never gets double-counted in the
  // post-search "no matches" decision.
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesTag = activeTag ? tool.tags.includes(activeTag) : true;
      const matchesQuery = normalizedQuery
        ? [
            tool.name,
            tool.description,
            tool.why,
            ...tool.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      return matchesTag && matchesQuery;
    });
  }, [tools, activeTag, query]);

  const showSections = viewMode === "grid" && !activeTag;
  const flatList = useMemo(() => {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered]);

  return (
    <>
      <div className="grid gap-3">
        {/* Tag pills row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("subCategoryLabel")}
          </span>
          <FilterPill
            label={t("tagSection.all")}
            active={activeTag === null}
            onClick={() => updateUrl({ tag: null })}
            count={tools.length}
          />
          {PRIMARY_TAGS.map((tag) => {
            const count = tools.filter((tool) => tool.tags.includes(tag)).length;
            return (
              <FilterPill
                key={tag}
                label={t(`tagSection.${tag}`)}
                active={activeTag === tag}
                onClick={() => updateUrl({ tag })}
                count={count}
              />
            );
          })}
          <span className="ml-1 font-mono text-xs text-muted-foreground">
            {t("toolCount", { count: filtered.length })}
          </span>
        </div>

        {/* Search + view toggle */}
        <div className="flex flex-wrap items-end gap-3 sm:flex-nowrap sm:items-center">
          <label className="grid flex-1 gap-1.5 text-xs text-muted-foreground">
            <span className="sr-only">{t("searchLabel")}</span>
            <span className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              />
              <Input
                className="pl-9"
                name="tool-search"
                autoComplete="off"
                aria-label={t("searchLabel")}
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  updateUrl({ q: event.target.value });
                }}
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

      <div className={cn("mt-8 grid gap-10")}>
        {filtered.length === 0 ? (
          <EmptyArchiveState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : showSections ? (
          PRIMARY_TAGS.map((tag) => {
            const sectionTools = filtered.filter((tool) =>
              tool.tags.includes(tag),
            );
            return (
              <TagSection
                key={tag}
                tagSlug={tag}
                label={t(`tagSection.${tag}`)}
                tools={sectionTools}
                locale={locale}
                viewMode="grid"
              />
            );
          })
        ) : viewMode === "grid" ? (
          // Single grid (tag filter active)
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {flatList.map((tool) => (
              <TagSection
                key={tool.slug}
                tagSlug={tool.slug}
                label=""
                tools={[tool]}
                locale={locale}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          // List view — collapses every match into one sortable list
          <ul className="grid gap-1 rounded-lg border border-border bg-card/40 p-1.5">
            {flatList.map((tool) => (
              <li key={tool.slug}>
                <ToolListRow resource={tool} locale={locale} />
              </li>
            ))}
          </ul>
        )}

        {/* Suggest clearing filters when search returns nothing */}
        {filtered.length === 0 && (query || activeTag) ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                updateUrl({ tag: null, q: "" });
              }}
            >
              {t("clearFilters")}
            </Button>
          </div>
        ) : null}
      </div>
    </>
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
