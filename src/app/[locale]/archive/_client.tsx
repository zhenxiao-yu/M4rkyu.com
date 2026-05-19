"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import { Bookmark } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import type { GalleryItem } from "@/content/schemas";
import { cn, FOCUS_RING } from "@/lib/utils";

// Lightbox is only needed after a user clicks a frame — defer the
// Dialog + per-frame controls bundle until first interaction.
const GalleryLightbox = dynamic(
  () =>
    import("@/components/gallery/gallery-lightbox").then(
      (mod) => mod.GalleryLightbox,
    ),
  { ssr: false },
);

interface GalleryGridProps {
  items: GalleryItem[];
  locale: string;
  /** Slugs the current user has saved (gallery item_type). Empty when guest. */
  savedSlugs: string[];
  signedIn: boolean;
}

export function GalleryGrid({ items, locale, savedSlugs, signedIn }: GalleryGridProps) {
  const savedSet = useMemo(() => new Set(savedSlugs), [savedSlugs]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const frame = searchParams.get("frame");
  const t = useTranslations("Gallery");

  const orderedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return 0;
    });
  }, [items]);

  const setOpenSlug = useCallback(
    (slug: string | null) => {
      const nextParams = new URLSearchParams(searchParams);
      if (slug === null) {
        nextParams.delete("frame");
      } else {
        nextParams.set("frame", slug);
      }
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  if (orderedItems.length === 0) {
    return (
      <EmptyArchiveState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <>
      {/* Hover hint strip — surfaces keyboard nav once above the grid. */}
      <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        {t("hoverHint")}
      </p>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {orderedItems.map((item) => (
          <FrameTile
            key={item.slug}
            item={item}
            saved={savedSet.has(item.slug)}
            onOpen={() => setOpenSlug(item.slug)}
            openLabel={t("openFrame", { title: item.title })}
            frameTbdLabel={t("frameTbd")}
            featuredLabel={t("featured")}
            savedLabel={t("saved")}
          />
        ))}
      </div>

      {frame !== null ? (
        <GalleryLightbox
          items={orderedItems}
          openSlug={frame}
          locale={locale}
          onChange={setOpenSlug}
          savedSlugs={savedSet}
          signedIn={signedIn}
        />
      ) : null}
    </>
  );
}

interface FrameTileProps {
  item: GalleryItem;
  saved: boolean;
  onOpen: () => void;
  openLabel: string;
  frameTbdLabel: string;
  featuredLabel: string;
  savedLabel: string;
}

function FrameTile({
  item,
  saved,
  onOpen,
  openLabel,
  frameTbdLabel,
  featuredLabel,
  savedLabel,
}: FrameTileProps) {
  const isDimmed = item.status === "coming-soon" || item.status === "draft";

  return (
    <button
      onClick={onOpen}
      type="button"
      aria-label={openLabel}
      className={cn(
        "group relative block overflow-hidden rounded-md border border-border bg-card/80 text-left transition-[border-color,box-shadow] duration-(--motion-base) ease-(--ease-premium) hover:border-ring hover:shadow-md",
        FOCUS_RING,
        isDimmed && "opacity-80",
      )}
    >
      <FrameThumb
        item={item}
        frameTbdLabel={frameTbdLabel}
        saved={saved}
        savedLabel={savedLabel}
      />

      <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
          >
            {item.type}
          </Badge>
          {item.featured ? (
            <Badge variant="signal" className="text-[0.6rem]">
              {featuredLabel}
            </Badge>
          ) : null}
        </div>
        <span className="text-sm font-semibold leading-tight text-foreground">
          {item.title}
        </span>
      </div>
    </button>
  );
}

function FrameThumb({
  item,
  frameTbdLabel,
  saved,
  savedLabel,
}: {
  item: GalleryItem;
  frameTbdLabel: string;
  saved: boolean;
  savedLabel: string;
}) {
  const aspect = aspectClass(item.aspect);
  const hasImage = Boolean(item.src);

  return (
    <div className={cn("relative overflow-hidden border-b bg-muted", aspect)}>
      {hasImage && item.src ? (
        <Image
          src={item.src.src}
          alt={item.src.alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover grayscale transition duration-300 group-hover:scale-[1.02] group-hover:grayscale-0"
        />
      ) : (
        <PlaceholderImage
          label={frameTbdLabel}
          aspect={aspect}
          className="rounded-none border-0"
        />
      )}

      {/* Saved indicator — always-on chip, discoverable across input modes. */}
      {saved ? (
        <span
          aria-label={savedLabel}
          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm border border-ring/60 bg-background/85 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground backdrop-blur-sm"
        >
          <Bookmark
            aria-hidden="true"
            className="size-2.5 fill-ring text-ring"
          />
          {savedLabel}
        </span>
      ) : null}

      {/* Hover metadata overlay — decorative; same data is in the lightbox. */}
      {(item.capturedAt || item.location) && hasImage ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-background/85 via-background/40 to-transparent px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-foreground opacity-0 transition-opacity duration-(--motion-base) ease-(--ease-premium) group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {item.location ? (
            <span className="truncate">{item.location}</span>
          ) : (
            <span />
          )}
          {item.capturedAt ? (
            <span className="shrink-0 tabular-nums">{item.capturedAt}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function aspectClass(aspect: GalleryItem["aspect"]): string {
  switch (aspect) {
    case "1/1":
      return "aspect-square";
    case "3/4":
      return "aspect-3/4";
    case "2/3":
      return "aspect-2/3";
    case "16/9":
      return "aspect-16/9";
    case "21/9":
      return "aspect-21/9";
    case "4/5":
    default:
      return "aspect-4/5";
  }
}
