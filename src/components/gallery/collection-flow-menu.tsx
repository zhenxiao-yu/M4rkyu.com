"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, MapPin } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { BlurImage } from "@/components/ui/blur-image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { mapsSearchUrl } from "@/content/gallery-curation";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import type { GalleryCollection } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

/**
 * Collection flow-menu — the archive index as an editorial wall of big-type
 * rows, one per collection. Base rows are real SSR links (catalogue Nº, cover
 * thumbnail, title, optional map link, frame count) so SEO / no-JS / keyboard
 * all get a clean tappable index that reads well on touch as-is.
 *
 * On pointer-fine + motion-OK clients each row gains a directional marquee:
 * hovering floods the row from the edge the cursor entered with an inverted
 * bar of the collection's name scrolling past its own frames (React Bits'
 * "Flowing Menu", rebuilt on the repo's `@keyframes marquee` — no GSAP, no new
 * deps). The marquee is an absolute `aria-hidden`, pointer-events-none overlay
 * (zero layout shift; clicks fall through to the row's stretched link).
 *
 * Scales to an unbounded set without a render hiccup: only the first
 * `INITIAL_VISIBLE` rows mount, and the rest stream in `LOAD_STEP` at a time —
 * auto-loaded as the trigger nears the viewport (infinite-loading feel) with
 * an explicit, accessible "show more" button as the floor.
 */

const INITIAL_VISIBLE = 8;
const LOAD_STEP = 8;
const MARQUEE_REPEATS = 6; // enough copies to fill ultra-wide rows seamlessly

function focalPosition(focal: GalleryCollection["cover"]["focal"]): string {
  if (focal === "top") return "center top";
  if (focal === "bottom") return "center bottom";
  return "center";
}

function hasRealCover(collection: GalleryCollection): boolean {
  return Boolean(collection.cover?.src?.includes("/storage/"));
}

interface CollectionFlowMenuProps {
  collections: GalleryCollection[];
  /** Real ready-frame count per collection slug. */
  counts: Record<string, number>;
  /** Map-search query per collection slug; present → row shows a map link. */
  placeQueries: Record<string, string>;
  locale: Locale;
}

export function CollectionFlowMenu({
  collections,
  counts,
  placeQueries,
  locale,
}: CollectionFlowMenuProps) {
  const t = useTranslations("Gallery");
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)", false);
  const enableMarquee = finePointer && !reduce;

  const total = collections.length;
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const shown = visible >= total ? collections : collections.slice(0, visible);
  const remaining = total - shown.length;

  const loadMore = useCallback(() => {
    setVisible((v) => Math.min(v + LOAD_STEP, total));
  }, [total]);

  // Auto-load as the trigger nears the viewport — the "infinite" feel — while
  // the button below stays the explicit, no-JS-safe fallback.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (remaining <= 0) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [remaining, loadMore]);

  return (
    <div>
      <ul className="border-t border-border/60">
        {shown.map((collection, i) => (
          <FlowRow
            key={collection.slug}
            collection={collection}
            index={i + 1}
            countLabel={t("framesCount", { count: counts[collection.slug] ?? 0 })}
            featuredLabel={t("featured")}
            placeQuery={placeQueries[collection.slug]}
            mapLabel={t("locateOnMap", { name: collection.title })}
            locale={locale}
            enableMarquee={enableMarquee}
          />
        ))}
      </ul>

      {remaining > 0 ? (
        <div
          ref={sentinelRef}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <Button
            type="button"
            variant="outline"
            onClick={loadMore}
            className="group/more gap-2"
          >
            {t("showMore", { count: remaining })}
            <ChevronDown
              aria-hidden="true"
              className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover/more:translate-y-0.5"
            />
          </Button>
          <span
            aria-live="polite"
            className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground tabular-nums"
          >
            {t("showingCount", { shown: shown.length, total })}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function FlowRow({
  collection,
  index,
  countLabel,
  featuredLabel,
  placeQuery,
  mapLabel,
  locale,
  enableMarquee,
}: {
  collection: GalleryCollection;
  index: number;
  countLabel: string;
  featuredLabel: string;
  placeQuery: string | undefined;
  mapLabel: string;
  locale: Locale;
  enableMarquee: boolean;
}) {
  const num = String(index).padStart(2, "0");
  const cover = hasRealCover(collection) ? collection.cover : null;
  const rowRef = useRef<HTMLLIElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  // Off-screen transform for the edge the cursor crosses, so the bar enters
  // and leaves from the side the pointer actually came from / went to.
  const offFor = (e: React.MouseEvent) => {
    const rect = rowRef.current?.getBoundingClientRect();
    const top = rect ? e.clientY - rect.top < rect.height / 2 : true;
    return top ? "translateY(-101%)" : "translateY(101%)";
  };

  const onEnter = (e: React.MouseEvent) => {
    const m = marqueeRef.current;
    if (!m) return;
    m.style.transition = "none";
    m.style.transform = offFor(e);
    void m.offsetWidth; // commit the start position before animating in
    m.style.transition = "transform 0.55s var(--ease-premium)";
    m.style.transform = "translateY(0)";
  };

  const onLeave = (e: React.MouseEvent) => {
    const m = marqueeRef.current;
    if (!m) return;
    m.style.transition = "transform 0.5s var(--ease-premium)";
    m.style.transform = offFor(e);
  };

  return (
    <li
      ref={rowRef}
      className={cn(
        "group relative isolate flex items-center gap-3 overflow-hidden border-b border-border/60 py-5 sm:gap-5 sm:py-7",
        collection.featured && "bg-ring/4",
      )}
      onMouseEnter={enableMarquee ? onEnter : undefined}
      onMouseLeave={enableMarquee ? onLeave : undefined}
    >
      {/* Stretched link — covers the whole row (anchored to the `relative` li
       * since the link itself stays static); the map link lifts above it. */}
      <Link
        href={`/archive/${collection.slug}`}
        locale={locale}
        aria-label={collection.title}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 outline-none after:absolute after:inset-0 after:content-[''] sm:gap-5",
          FOCUS_RING_INSET,
        )}
      >
        <span className="w-9 shrink-0 font-mono text-[0.6rem] uppercase tabular-nums tracking-[0.18em] text-muted-foreground sm:w-12">
          Nº{num}
        </span>
        <RowThumb cover={cover} num={num} />
        <span className="min-w-0 flex-1 truncate font-display text-[clamp(1.5rem,5vw,3.25rem)] font-semibold leading-none tracking-tight text-foreground transition-colors duration-(--motion-base) ease-(--ease-premium) group-hover:text-ring group-focus-within:text-ring">
          {collection.title}
        </span>
      </Link>

      {collection.featured ? (
        <Badge
          variant="signal"
          className="hidden shrink-0 text-[0.55rem] sm:inline-flex"
        >
          {featuredLabel}
        </Badge>
      ) : null}

      {placeQuery ? (
        <a
          href={mapsSearchUrl(placeQuery)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={mapLabel}
          title={mapLabel}
          className={cn(
            "relative z-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-ring/10 hover:text-ring sm:size-8",
            FOCUS_RING,
          )}
        >
          <MapPin aria-hidden="true" className="size-4" />
        </a>
      ) : null}

      <span className="hidden shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground md:block">
        {countLabel}
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-5 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
      />

      {enableMarquee ? (
        <div
          ref={marqueeRef}
          aria-hidden="true"
          style={{ transform: "translateY(101%)" }}
          className="pointer-events-none absolute inset-0 z-2 flex items-center overflow-hidden bg-foreground text-background"
        >
          <div className="flex w-max items-center pl-3 [animation-play-state:paused] motion-safe:animate-[marquee_22s_linear_infinite] group-hover:[animation-play-state:running]">
            <MarqueeContent collection={collection} cover={cover} num={num} />
            <MarqueeContent collection={collection} cover={cover} num={num} />
          </div>
        </div>
      ) : null}
    </li>
  );
}

function RowThumb({
  cover,
  num,
}: {
  cover: GalleryCollection["cover"] | null;
  num: string;
}) {
  return (
    <span className="relative aspect-3/4 w-9 shrink-0 overflow-hidden rounded-sm border border-border bg-muted sm:w-12">
      {cover ? (
        <BlurImage
          src={cover.src}
          alt=""
          fill
          sizes="48px"
          className="object-cover grayscale transition duration-(--motion-medium) ease-(--ease-premium) group-hover:grayscale-0"
          style={{ objectPosition: focalPosition(cover.focal) }}
        />
      ) : (
        <>
          <span aria-hidden="true" className="absolute inset-0 contact-sheet opacity-70" />
          <span className="absolute inset-0 grid place-items-center font-display text-[0.7rem] font-bold tabular-nums text-foreground/40">
            {num}
          </span>
        </>
      )}
    </span>
  );
}

function MarqueeContent({
  collection,
  cover,
  num,
}: {
  collection: GalleryCollection;
  cover: GalleryCollection["cover"] | null;
  num: string;
}) {
  return (
    <div aria-hidden="true" className="flex shrink-0 items-center gap-6 pr-6">
      {Array.from({ length: MARQUEE_REPEATS }).map((_, k) => (
        <Fragment key={k}>
          <span className="whitespace-nowrap font-display text-[clamp(1.5rem,5vw,3.25rem)] font-semibold uppercase leading-none tracking-tight">
            {collection.title}
          </span>
          <span className="size-1.5 shrink-0 rounded-full bg-ring" />
          <span className="relative aspect-3/4 h-14 shrink-0 overflow-hidden rounded-sm bg-background/10 ring-1 ring-background/25 sm:h-16">
            {cover ? (
              <BlurImage
                src={cover.src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                style={{ objectPosition: focalPosition(cover.focal) }}
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center font-mono text-[0.6rem] uppercase tracking-[0.15em] text-background/70">
                Nº{num}
              </span>
            )}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
