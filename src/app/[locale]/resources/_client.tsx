"use client"

import { useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ExternalLink, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state"
import type { Resource } from "@/content/schemas"

export function ResourcesClient({
  resources,
  categories,
}: {
  resources: Resource[]
  categories: string[]
}) {
  const t = useTranslations("Resources")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const activeCategory = searchParams.get("category")
  const selectedCategory = activeCategory && categories.includes(activeCategory) ? activeCategory : null
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  function updateUrl(next: { category?: string | null; q?: string }) {
    const params = new URLSearchParams(searchParams)
    if ("category" in next) {
      if (next.category) params.set("category", next.category)
      else params.delete("category")
    }
    if ("q" in next) {
      const value = next.q?.trim()
      if (value) params.set("q", value)
      else params.delete("q")
    }

    startTransition(() => {
      const nextQuery = params.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    })
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return resources.filter((resource) => {
      const matchesCategory = selectedCategory ? resource.category === selectedCategory : true
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
        : true
      return matchesCategory && matchesQuery
    })
  }, [query, resources, selectedCategory])

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => updateUrl({ category: null })}
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            aria-pressed={!selectedCategory}
          >
            <Badge variant={!selectedCategory ? "success" : "outline"}>{t("categoryAll")}</Badge>
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
              <Badge variant={selectedCategory === category ? "success" : "outline"}>
                {category}
              </Badge>
            </Button>
          ))}
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {t("filterSummary", { filtered: filtered.length, total: resources.length })}
          </span>
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
                setQuery(event.target.value)
                updateUrl({ q: event.target.value })
              }}
            />
          </span>
        </label>
      </div>

      {filtered.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((resource) => (
            <Card key={resource.slug} className="bg-card/80">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{resource.category}</Badge>
                  <Badge variant="warning">{resource.status}</Badge>
                  <Badge variant="outline">{resource.pricing}</Badge>
                </div>
                <CardTitle>{resource.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{resource.description}</p>
                <p>{resource.why}</p>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    {t("visit")}
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                </Button>
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
  )
}
