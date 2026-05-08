"use client"

import { useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { ProjectCard } from "@/components/cards/project-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stagger, StaggerItem } from "@/components/motion/stagger"
import type { Project } from "@/content/schemas"
import type { Locale } from "@/i18n/routing"

const FILTERS: { label: string; value: Project["category"] | null }[] = [
  { label: "All", value: null },
  { label: "Web Apps", value: "web-app" },
  { label: "Game Dev", value: "game-dev" },
  { label: "AI Tools", value: "ai-tool" },
  { label: "Art/Film", value: "art-film" },
  { label: "Experiments", value: "experiment" },
]

const categories = new Set(FILTERS.map((filter) => filter.value).filter(Boolean))

export function ProjectsClient({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const categoryParam = searchParams.get("category")
  const active = categories.has(categoryParam as Project["category"])
    ? (categoryParam as Project["category"])
    : null
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  function updateUrl(next: { category?: Project["category"] | null; q?: string }) {
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
    let result = projects
    if (active !== null) {
      result = result.filter((p) => p.category === active)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (p) =>
            p.title.toLowerCase().includes(q) ||
          p.shortPitch.toLowerCase().includes(q) ||
          p.stack.some((s) => s.toLowerCase().includes(q))
      )
    }
    return result
  }, [projects, active, query])

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(({ label, value }) => (
            <Button
              key={label}
              onClick={() => updateUrl({ category: value })}
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              aria-pressed={active === value}
            >
              <Badge
                variant={active === value ? "success" : "outline"}
                className="cursor-pointer transition-colors"
              >
                {label}
              </Badge>
            </Button>
          ))}
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {filtered.length} / {projects.length}
          </span>
        </div>
        <label className="grid gap-2 text-sm text-muted-foreground">
          Search
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              className="pl-9"
              name="project-search"
              autoComplete="off"
              placeholder="Filter by name or stack…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                updateUrl({ q: e.target.value })
              }}
            />
          </span>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center font-mono text-sm text-muted-foreground">
          No projects match this filter.
        </p>
      ) : (
        <Stagger className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" delay={0.05}>
          {filtered.map((project) => (
            <StaggerItem key={project.slug}>
              <ProjectCard project={project} locale={locale} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </>
  )
}
