"use client";

import { ArrowUpRight, BookOpen, Film, Hammer, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Carousel } from "@/components/ui/magic/carousel";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { profile } from "@/content/profile";

const KIND_ICON = {
  building: Hammer,
  reading: BookOpen,
  listening: Headphones,
  watching: Film,
} as const;

type Kind = keyof typeof KIND_ICON;

/**
 * Compact auto-rotating status strip. One line per slide:
 *   ⚒  Building — m4rkyu.com
 * Kept tight on purpose — this card should read like a footer note,
 * not a manifesto.
 */
export function CurrentlyCarouselCard({ className }: { className?: string }) {
  const t = useTranslations("About.currently");
  const items = profile.currently;

  if (items.length === 0) {
    return (
      <Card className={cn("h-full bg-card/80", className)}>
        <CardHeader className="space-y-1 p-4">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            /currently
          </p>
          <CardTitle className="text-sm">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs leading-5 text-muted-foreground">
            {t("empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="flex flex-row items-baseline justify-between gap-3 space-y-0 p-4">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          /currently
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Carousel
          ariaLabel={t("title")}
          autoplayDelay={5000}
          slideLabels={items.map((i) => t(`kinds.${i.kind}`))}
          controlLabels={{ prev: t("prev"), next: t("next") }}
        >
          {items.map((item, i) => {
            const Icon = KIND_ICON[item.kind as Kind];
            const content = (
              <span className="flex min-w-0 items-baseline gap-2">
                <Icon
                  className="size-3.5 shrink-0 translate-y-0.5 text-ring"
                  aria-hidden="true"
                />
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {t(`kinds.${item.kind}`)}
                </span>
                <span className="truncate text-sm text-foreground">
                  {item.label}
                </span>
              </span>
            );
            return (
              <div key={i} className="min-h-[2.25rem]">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group/cur inline-flex w-full items-center justify-between gap-2 rounded-md py-1",
                      FOCUS_RING_INSET,
                    )}
                  >
                    {content}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3 shrink-0 text-muted-foreground transition-colors group-hover/cur:text-foreground"
                    />
                  </a>
                ) : (
                  <div className="py-1">{content}</div>
                )}
              </div>
            );
          })}
        </Carousel>
      </CardContent>
    </Card>
  );
}
