"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Play, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Resource } from "@/content/schemas";

type TypeFilter = "all" | "tool" | "link";
const TYPE_FILTERS: TypeFilter[] = ["all", "tool", "link"];

export function ResourcesClient({
  resources,
  categories,
}: {
  resources: Resource[];
  categories: string[];
}) {
  const t = useTranslations("Resources");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale() as Locale;
  const [, startTransition] = useTransition();
  const activeCategory = searchParams.get("category");
  const selectedCategory =
    activeCategory && categories.includes(activeCategory)
      ? activeCategory
      : null;
  const typeParam = searchParams.get("type") as TypeFilter | null;
  const selectedType: TypeFilter = TYPE_FILTERS.includes(typeParam as TypeFilter)
    ? (typeParam as TypeFilter)
    : "all";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateUrl(next: {
    category?: string | null;
    q?: string;
    type?: TypeFilter;
  }) {
    const params = new URLSearchParams(searchParams);
    if ("category" in next) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }
    if ("q" in next) {
      const value = next.q?.trim();
      if (value) params.set("q", value);
      else params.delete("q");
    }
    if ("type" in next) {
      if (next.type && next.type !== "all") params.set("type", next.type);
      else params.delete("type");
    }

    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    });
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory = selectedCategory
        ? resource.category === selectedCategory
        : true;
      const matchesType =
        selectedType === "all" ? true : resource.type === selectedType;
      const matchesQuery = normalizedQuery
        ? [
            resource.name,
            resource.category,
            resource.description,
            resource.why,
            resource.pricing,
            ...resource.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      return matchesCategory && matchesType && matchesQuery;
    });
  }, [query, resources, selectedCategory, selectedType]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => updateUrl({ category: null })}
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              aria-pressed={!selectedCategory}
            >
              <Badge variant={!selectedCategory ? "success" : "outline"}>
                {t("categoryAll")}
              </Badge>
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => updateUrl({ category })}
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                aria-pressed={selectedCategory === category}
              >
                <Badge
                  variant={
                    selectedCategory === category ? "success" : "outline"
                  }
                >
                  {category}
                </Badge>
              </Button>
            ))}
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {t("filterSummary", {
                filtered: filtered.length,
                total: resources.length,
              })}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {t("typeLabel")}
            </span>
            {TYPE_FILTERS.map((type) => (
              <Button
                key={type}
                onClick={() => updateUrl({ type })}
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                aria-pressed={selectedType === type}
              >
                <Badge
                  variant={selectedType === type ? "success" : "outline"}
                  className="cursor-pointer"
                >
                  {t(`type.${type}`)}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        <label className="grid gap-2 text-sm text-muted-foreground">
          {t("searchLabel")}
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              className="pl-9"
              name="resource-search"
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
      </div>

      {filtered.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((resource) => (
            <Card key={resource.slug} className="flex h-full flex-col bg-card/80">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  {resource.type === "tool" ? (
                    <Badge variant="success" className="gap-1">
                      <Play
                        aria-hidden="true"
                        className="size-2.5 fill-current"
                      />
                      {t("type.tool")}
                    </Badge>
                  ) : null}
                  <Badge variant="outline">{resource.category}</Badge>
                  <Badge variant="warning">{resource.status}</Badge>
                  <Badge variant="outline">{resource.pricing}</Badge>
                </div>
                <CardTitle>{resource.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 text-sm leading-6 text-muted-foreground">
                <p>{resource.description}</p>
                <p>{resource.why}</p>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto">
                  {resource.type === "tool" ? (
                    <Button asChild size="sm">
                      <Link
                        href={`/resources/${resource.slug}`}
                        locale={locale}
                      >
                        {t("openTool")}
                        <Play
                          className="size-3.5 fill-current"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("visit")}
                        <ExternalLink
                          className="size-4"
                          aria-hidden="true"
                        />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyArchiveState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        </div>
      )}
    </>
  );
}
