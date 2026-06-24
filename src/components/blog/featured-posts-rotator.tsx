"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, MessageSquare, Sparkles } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import {
  BentoRotatorShell,
  type BentoRotatorLabels,
} from "@/components/ui/magic/bento-rotator-shell";
import type { Post } from "@/content/schemas";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING } from "@/lib/utils";

// Same dynamic strategy as the resources rotator — keeps the OGL
// chunk out of SSR and out of touch / reduced-motion code paths.
const GridDistortion = dynamic(
  () =>
    import("@/components/ui/magic/grid-distortion").then((mod) => ({
      default: mod.GridDistortion,
    })),
  { ssr: false },
);

interface FeaturedPostsRotatorProps {
  posts: Post[];
  locale: Locale;
  labels: BentoRotatorLabels & {
    /** Template `"Read {name}"`. */
    openAria: string;
    /** "Read note" CTA label. */
    ctaLabel: string;
  };
  /** Storage key for the collapse preference. */
  collapseStorageKey?: string;
}

const PAGE_SIZE = 7;
const DEFAULT_COLLAPSE_KEY = "m4rkyu:logs:bento-collapsed";
const HIGHLIGHT_MS = 1500;

/**
 * Mosaic spotlight bento for `/logs`. Same shell + 4×3 grid as the
 * resources rotator, but the tiles render post-shaped content
 * (cover image, date, reading time, tag chips). Falls back to a
 * static page when fewer than `PAGE_SIZE` posts exist.
 */
export function FeaturedPostsRotator({
  posts,
  locale,
  labels,
  collapseStorageKey = DEFAULT_COLLAPSE_KEY,
}: FeaturedPostsRotatorProps) {
  if (posts.length === 0) return null;
  return (
    <BentoRotatorShell
      items={posts}
      pageSize={PAGE_SIZE}
      getItemKey={(post) => post.slug}
      labels={labels}
      collapseStorageKey={collapseStorageKey}
      renderBackdrop={() => (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 overflow-hidden rounded-lg opacity-30 mix-blend-screen dark:opacity-25 dark:mix-blend-plus-lighter"
        >
          <GridDistortion mouse={0.1} strength={0.15} grid={15} />
        </div>
      )}
      renderPage={(pagePosts, pageIndex) => {
        const isStatic = posts.length <= PAGE_SIZE;
        const visible = pagePosts.slice(0, PAGE_SIZE);
        const [hero, t2, t3, t4, t5, t6, t7] = visible;
        return (
          <MosaicGrid>
            {hero ? (
              <PostHeroTile
                key={`hero-${pageIndex}-${hero.slug}`}
                post={hero}
                locale={locale}
                openAriaTemplate={labels.openAria}
                ctaLabel={labels.ctaLabel}
                highlight={!isStatic}
              />
            ) : null}
            {t2 ? (
              <PostSecondaryTile
                key={`t2-${pageIndex}-${t2.slug}`}
                post={t2}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-1 lg:col-span-1 lg:row-span-1"
              />
            ) : null}
            {t3 ? (
              <PostSecondaryTile
                key={`t3-${pageIndex}-${t3.slug}`}
                post={t3}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-1 lg:col-span-1 lg:row-span-1"
              />
            ) : null}
            {t4 ? (
              <PostWideTile
                key={`t4-${pageIndex}-${t4.slug}`}
                post={t4}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-2 lg:col-span-2 lg:row-span-1"
              />
            ) : null}
            {t5 ? (
              <PostSecondaryTile
                key={`t5-${pageIndex}-${t5.slug}`}
                post={t5}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-1 lg:col-span-1 lg:row-span-1"
              />
            ) : null}
            {t6 ? (
              <PostSecondaryTile
                key={`t6-${pageIndex}-${t6.slug}`}
                post={t6}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-1 lg:col-span-1 lg:row-span-1"
              />
            ) : null}
            {t7 ? (
              <PostWideTile
                key={`t7-${pageIndex}-${t7.slug}`}
                post={t7}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-2 lg:col-span-2 lg:row-span-1"
              />
            ) : null}
          </MosaicGrid>
        );
      }}
    />
  );
}

function MosaicGrid({ children }: { children: React.ReactNode }) {
  // Mirror of the resources MosaicGrid — same breakpoints, same
  // snap-scroll on mobile. Identical layout keeps the two rotators
  // visually consistent across pages.
  return (
    <div
      className={cn(
        "grid gap-3",
        "snap-y snap-mandatory max-h-[80vh] overflow-y-auto md:overflow-visible md:max-h-none md:snap-none",
        "md:grid-cols-2 md:auto-rows-[minmax(10rem,1fr)]",
        "lg:grid-cols-4 lg:auto-rows-[minmax(9.5rem,1fr)]",
      )}
    >
      {children}
    </div>
  );
}

function PostHeroTile({
  post,
  locale,
  openAriaTemplate,
  ctaLabel,
  highlight,
}: {
  post: Post;
  locale: Locale;
  openAriaTemplate: string;
  ctaLabel: string;
  highlight: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const ariaLabel = openAriaTemplate.replace("{name}", post.title);
  // Same pattern as resources: parent remounts this tile per page,
  // so `useState(initial)` re-evaluates without an effect-body
  // setState. Off-timer fires from the setTimeout callback, which
  // is allowed by `react-hooks/set-state-in-effect`.
  const initialBeam = highlight && !reduceMotion;
  const [showBeam, setShowBeam] = useState(initialBeam);
  useEffect(() => {
    if (!initialBeam) return;
    const id = window.setTimeout(() => setShowBeam(false), HIGHLIGHT_MS);
    return () => window.clearTimeout(id);
  }, [initialBeam]);

  // dev.to posts may or may not have a cover image. When absent, fall
  // back to the cyber-grid + accent gradient — same precedent as
  // featured-post-card; no PlaceholderImage flash.
  const cover = post.coverImage;

  return (
    <Link
      href={`/logs/${post.slug}`}
      locale={locale}
      aria-label={ariaLabel}
      className={cn(
        "group relative isolate flex h-full min-h-[18rem] flex-col overflow-hidden rounded-lg border border-border bg-card/80 transition-[border-color] duration-(--motion-fast) ease-(--ease-premium)",
        "snap-start scroll-mt-4",
        "md:col-span-2 md:min-h-[22rem]",
        "lg:col-span-2 lg:row-span-2",
        "hover:border-ring/70",
        FOCUS_RING,
      )}
    >
      {/* Cover image as a low-opacity background layer behind the
          content. `priority` only on the visible hero to keep
          off-screen pages cheap. */}
      {cover ? (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={cover.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover opacity-40 transition-transform duration-(--motion-medium) ease-(--ease-premium) group-hover:scale-[1.03]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-card via-card/82 to-card/30"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cyber-grid opacity-25"
        />
      )}
      <PointerSpotlight radius={520} intensity={0.22} />
      {showBeam ? <BorderBeam borderRadius={8} duration={3} /> : null}

      <div className="relative z-20 flex h-full flex-col gap-4 p-6">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/75 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-foreground backdrop-blur">
            <Sparkles aria-hidden="true" className="size-3 text-ring" />
            {post.category}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {post.date}
          </span>
        </div>

        <h3 className="shrink-0 font-display text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
          {post.title}
        </h3>

        <p className="flex-1 max-w-prose text-sm leading-6 text-muted-foreground line-clamp-6 md:line-clamp-none sm:text-base sm:leading-7">
          {post.excerpt}
        </p>

        {post.tags.length > 0 ? (
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-background/55 font-mono text-[0.55rem]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-3">
          <span className="flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{post.readingTime}</span>
            {post.reactionsCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Heart aria-hidden="true" className="size-3" />
                {post.reactionsCount}
              </span>
            ) : null}
            {post.commentsCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <MessageSquare aria-hidden="true" className="size-3" />
                {post.commentsCount}
              </span>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-foreground">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {ctaLabel}
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostSecondaryTile({
  post,
  locale,
  openAriaTemplate,
  spanClass,
}: {
  post: Post;
  locale: Locale;
  openAriaTemplate: string;
  spanClass?: string;
}) {
  const ariaLabel = openAriaTemplate.replace("{name}", post.title);
  const cover = post.coverImage;

  return (
    <Link
      href={`/logs/${post.slug}`}
      locale={locale}
      aria-label={ariaLabel}
      className={cn(
        "group relative isolate flex h-full min-h-[9rem] flex-col justify-between gap-3 overflow-hidden rounded-lg border border-border bg-card/80 p-4 transition-[border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        "snap-start scroll-mt-4",
        "hover:border-ring/60 motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
        spanClass,
      )}
    >
      <PointerSpotlight radius={300} intensity={0.18} />
      <div className="relative z-20 flex items-start gap-3">
        {/* Small cover thumbnail — lazy-loaded since these tiles are
            secondary. Falls back to a square accent block when the
            dev.to post has no cover. */}
        <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-border/70 bg-background/60">
          {cover ? (
            <Image
              src={cover.src}
              alt=""
              fill
              loading="lazy"
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <Sparkles aria-hidden="true" className="size-4 text-ring" />
          )}
        </span>
        <div className="min-w-0 grid gap-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
            {post.title}
          </h3>
          <p className="line-clamp-1 text-xs leading-5 text-muted-foreground">
            {post.excerpt}
          </p>
        </div>
      </div>
      <div className="relative z-20 flex items-center justify-between gap-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{post.date}</span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
        />
      </div>
    </Link>
  );
}

function PostWideTile({
  post,
  locale,
  openAriaTemplate,
  spanClass,
}: {
  post: Post;
  locale: Locale;
  openAriaTemplate: string;
  spanClass?: string;
}) {
  const ariaLabel = openAriaTemplate.replace("{name}", post.title);
  const cover = post.coverImage;

  return (
    <Link
      href={`/logs/${post.slug}`}
      locale={locale}
      aria-label={ariaLabel}
      className={cn(
        "group relative isolate flex h-full min-h-[9rem] overflow-hidden rounded-lg border border-border bg-card/80 transition-[border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        "snap-start scroll-mt-4",
        "hover:border-ring/60 motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
        spanClass,
      )}
    >
      {/* Cover on the left, content on the right. Cover gets a
          consistent 1/3 width on lg so the two wide tiles read in
          rhythm with each other. */}
      <div className="relative hidden w-1/3 shrink-0 overflow-hidden bg-muted sm:block">
        {cover ? (
          <Image
            src={cover.src}
            alt=""
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 16vw, 33vw"
            className="object-cover transition-transform duration-(--motion-medium) ease-(--ease-premium) group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-cyber-grid opacity-30" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-8 bg-linear-to-l from-card/90 to-transparent"
        />
      </div>
      <PointerSpotlight radius={380} intensity={0.2} />
      <div className="relative z-20 flex h-full flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight">
            {post.title}
          </h3>
        </div>
        <p className="flex-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3">
          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="font-mono text-[0.62rem]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
              {post.date}
            </span>
          )}
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
          />
        </div>
      </div>
    </Link>
  );
}
