"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/cards/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkDeckReveal } from "@/components/sections/work-deck-reveal";
import type { Project } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";

const FILTERS: { labelKey: string; value: Project["category"] | null }[] = [
  { labelKey: "all", value: null },
  { labelKey: "web-app", value: "web-app" },
  { labelKey: "game-dev", value: "game-dev" },
  { labelKey: "ai-tool", value: "ai-tool" },
  { labelKey: "art-film", value: "art-film" },
  { labelKey: "experiment", value: "experiment" },
];

const CATEGORY_VALUES = new Set(
  FILTERS.map((filter) => filter.value).filter(Boolean) as Project["category"][],
);

const ALL_YEARS = "__all__";

export function ProjectsClient({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Categories");

  const categoryParam = searchParams.get("category");
  const activeCategory = CATEGORY_VALUES.has(
    categoryParam as Project["category"],
  )
    ? (categoryParam as Project["category"])
    : null;
  const yearParam = searchParams.get("year");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const yearOptions = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.year))).sort((a, b) =>
        b.localeCompare(a),
      ),
    [projects],
  );
  const activeYear = yearOptions.includes(yearParam ?? "")
    ? (yearParam as string)
    : ALL_YEARS;

  function updateUrl(next: {
    category?: Project["category"] | null;
    year?: string | null;
    q?: string;
  }) {
    const params = new URLSearchParams(searchParams);
    if ("category" in next) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }
    if ("year" in next) {
      if (next.year && next.year !== ALL_YEARS) params.set("year", next.year);
      else params.delete("year");
    }
    if ("q" in next) {
      const value = next.q?.trim();
      if (value) params.set("q", value);
      else params.delete("q");
    }
    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    });
  }

  const filtered = useMemo(() => {
    let result = projects;
    if (activeCategory !== null) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (activeYear !== ALL_YEARS) {
      result = result.filter((p) => p.year === activeYear);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortPitch.toLowerCase().includes(q) ||
          p.stack.some((s) => s.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [projects, activeCategory, activeYear, query]);

  const production = useMemo(
    () => filtered.filter((p) => p.contentStatus === "ready"),
    [filtered],
  );
  const drafts = useMemo(
    () => filtered.filter((p) => p.contentStatus !== "ready"),
    [filtered],
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(({ labelKey, value }) => (
            <Button
              key={labelKey}
              onClick={() => updateUrl({ category: value })}
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              aria-pressed={activeCategory === value}
            >
              <Badge
                variant={activeCategory === value ? "success" : "outline"}
                className="cursor-pointer transition-colors"
              >
                {value === null ? t("filterAll") : tCategories(value)}
              </Badge>
            </Button>
          ))}
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {filtered.length} / {projects.length}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">
              {t("yearLabel")}
            </span>
            <Select
              value={activeYear}
              onValueChange={(value) => updateUrl({ year: value })}
            >
              <SelectTrigger aria-label={t("yearLabel")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_YEARS}>{t("yearAll")}</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">
              {t("searchLabel")}
            </span>
            <span className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                name="project-search"
                autoComplete="off"
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  updateUrl({ q: e.target.value });
                }}
              />
            </span>
          </label>
        </div>
      </div>

      {production.length === 0 && drafts.length === 0 ? (
        <p className="mt-16 text-center font-mono text-sm text-muted-foreground">
          {t("noMatches")}
        </p>
      ) : null}

      {production.length > 0 ? (
        // Re-key on chip / year changes so the deck restages cleanly.
        // Search query is intentionally excluded — keystrokes would
        // otherwise re-mount the grid mid-typing and steal focus state.
        <WorkDeckReveal
          key={`deck-${activeCategory ?? "all"}-${activeYear}`}
        >
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {production.map((project) => (
              <div data-deck-card key={project.slug}>
                <ProjectCard project={project} locale={locale} />
              </div>
            ))}
          </div>
        </WorkDeckReveal>
      ) : null}

      {production.length === 0 && drafts.length > 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {t("noProductionMatches", { count: drafts.length })}
        </p>
      ) : null}

      {drafts.length > 0 ? (
        <details className="mt-12 group rounded-lg border border-dashed border-border bg-muted/20">
          <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <span className="flex items-center gap-3">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                {t("draftsHeading")}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("draftsCount", { count: drafts.length })}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-open:rotate-180"
            />
          </summary>
          <div className="border-t p-5">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {drafts.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </details>
      ) : null}
    </>
  );
}
