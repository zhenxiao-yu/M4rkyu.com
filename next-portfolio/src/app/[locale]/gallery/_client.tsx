"use client"

import { useEffect, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlaceholderImage } from "@/components/placeholders/placeholder-image"
import type { GalleryItem } from "@/content/schemas"

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const frame = searchParams.get("frame")
  const openIndex = frame ? items.findIndex((item) => item.slug === frame) : -1
  const hasOpenFrame = openIndex >= 0

  const setOpenIndex = useCallback(
    (index: number | null) => {
      const nextParams = new URLSearchParams(searchParams)
      if (index === null) {
        nextParams.delete("frame")
      } else {
        nextParams.set("frame", items[index].slug)
      }
      const query = nextParams.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [items, pathname, router, searchParams],
  )

  const prev = useCallback(() => {
    if (!hasOpenFrame) return
    setOpenIndex((openIndex - 1 + items.length) % items.length)
  }, [hasOpenFrame, items.length, openIndex, setOpenIndex])

  const next = useCallback(() => {
    if (!hasOpenFrame) return
    setOpenIndex((openIndex + 1) % items.length)
  }, [hasOpenFrame, items.length, openIndex, setOpenIndex])

  useEffect(() => {
    if (!hasOpenFrame) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [hasOpenFrame, prev, next])

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item.slug}
            onClick={() => setOpenIndex(index)}
            className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
            aria-label={`Open ${item.title}`}
          >
            <Card className="overflow-hidden bg-card/80 transition-[border-color,box-shadow] duration-200 group-hover:border-ring group-hover:shadow-md">
              <PlaceholderImage
                label={index % 2 === 0 ? "GALLERY IMAGE TBD" : "CONTACT SHEET TBD"}
                aspect="aspect-[4/5]"
                className="rounded-none border-0 border-b"
              />
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>

      <Dialog open={hasOpenFrame} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {hasOpenFrame ? items[openIndex]?.title : ""}
            </DialogTitle>
            <DialogDescription>
              {hasOpenFrame ? `${openIndex + 1} / ${items.length}` : ""}
            </DialogDescription>
          </DialogHeader>
          {hasOpenFrame && (
            <>
              <PlaceholderImage label="LIGHTBOX MEDIA TBD" aspect="aspect-[4/3]" />
              <p className="text-sm leading-6 text-muted-foreground">
                {items[openIndex]?.caption}
              </p>
              <div className="flex items-center justify-between pt-1">
                <Button
                  onClick={prev}
                  aria-label="Previous image"
                  type="button"
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="font-mono text-xs text-muted-foreground">
                  {openIndex + 1} / {items.length}
                </span>
                <Button
                  onClick={next}
                  aria-label="Next image"
                  type="button"
                  size="icon"
                  variant="outline"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
