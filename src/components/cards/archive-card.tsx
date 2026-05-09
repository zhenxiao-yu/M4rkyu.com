"use client"

import { ArrowUpRight } from "lucide-react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DraftBadge } from "@/components/placeholders/draft-badge"
import { PlaceholderImage } from "@/components/placeholders/placeholder-image"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"

const ease = [0.2, 0.7, 0.2, 1] as const

export function ArchiveCard({
  title,
  description,
  eyebrow,
  status,
  href,
  locale,
  mediaLabel = "MEDIA TBD",
}: {
  title: string
  description: string
  eyebrow?: string
  status?: "ready" | "draft" | "placeholder" | "coming-soon"
  href?: string
  locale?: Locale
  mediaLabel?: string
}) {
  const content = (
    <Card className="group h-full overflow-hidden bg-card/80 transition-[border-color,box-shadow] duration-200 hover:border-ring hover:shadow-md">
      <PlaceholderImage
        label={mediaLabel}
        aspect="aspect-4/3"
        className="rounded-none border-0 border-b"
      />
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          {eyebrow ? <Badge variant="outline">{eyebrow}</Badge> : null}
          {status && status !== "ready" ? <DraftBadge label={status} /> : null}
        </div>
        <CardTitle className="leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        {href && locale ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            Open archive
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  )

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease }}
      className="h-full"
    >
      {href && locale ? (
        <Link href={href} locale={locale} className="block h-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  )
}
