"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { FrameTile, orderFrames } from "@/components/gallery/frame-tile";
import { useGallerySaves } from "@/lib/social/use-gallery-saves";
import type { GalleryItem } from "@/content/schemas";

const GalleryLightbox = dynamic(
  () =>
    import("@/components/gallery/gallery-lightbox").then(
      (mod) => mod.GalleryLightbox,
    ),
  { ssr: false },
);

// Aspect-aware ordered masonry. Each frame keeps its true aspect ratio
// (full artwork, no crop) and varies in height; a ResizeObserver maps
// each measured tile to the right number of 8px grid rows so columns
// pack tightly while reading order (pinned → featured → source) is
// preserved left-to-right. No layout library — just CSS grid + the
// browser's ResizeObserver. Tile heights are reserved by CSS
// `aspect-ratio` on first paint, so SSR/no-JS still renders correctly;
// the observer only tightens the vertical packing.
const ROW = 8;
const GAP = 12; // matches gap-3 (0.75rem)

interface GalleryMasonryProps {
  items: GalleryItem[];
  locale: string;
}

export function GalleryMasonry({ items, locale }: GalleryMasonryProps) {
  // Per-user saved state is read client-side so the host page can be
  // statically rendered / ISR (no per-request cookies()).
  const { savedSlugs: savedSet, signedIn } = useGallerySaves();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const frame = searchParams.get("frame");
  const t = useTranslations("Gallery");
  const containerRef = useRef<HTMLDivElement>(null);

  const orderedItems = useMemo(() => orderFrames(items), [items]);

  const setOpenSlug = useCallback(
    (slug: string | null) => {
      const nextParams = new URLSearchParams(searchParams);
      if (slug === null) nextParams.delete("frame");
      else nextParams.set("frame", slug);
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  // Map each tile's measured height to a row span. Direct DOM writes
  // (no React state) so this never triggers re-render loops or the
  // set-state-in-effect rule.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const layoutCell = (cell: HTMLElement) => {
      const content = cell.firstElementChild as HTMLElement | null;
      if (!content) return;
      const height = content.getBoundingClientRect().height;
      const span = Math.max(1, Math.ceil((height + GAP) / (ROW + GAP)));
      cell.style.gridRowEnd = `span ${span}`;
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cell = (entry.target as HTMLElement).parentElement;
        if (cell) layoutCell(cell);
      }
    });

    const cells = Array.from(
      container.querySelectorAll<HTMLElement>("[data-masonry-cell]"),
    );
    for (const cell of cells) {
      layoutCell(cell);
      const content = cell.firstElementChild;
      if (content) observer.observe(content);
    }

    return () => observer.disconnect();
  }, [orderedItems]);

  if (orderedItems.length === 0) {
    return (
      <EmptyArchiveState
        title={t("collectionMediaPendingTitle")}
        description={t("collectionMediaPendingDescription")}
      />
    );
  }

  return (
    <>
      <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        {t("hoverHint")}
      </p>
      <div
        ref={containerRef}
        className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(11rem,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(14rem,1fr))]"
        style={{ gridAutoRows: `${ROW}px` }}
      >
        {orderedItems.map((item) => (
          <div key={item.slug} data-masonry-cell>
            <FrameTile
              item={item}
              variant="bare"
              saved={savedSet.has(item.slug)}
              onOpen={() => setOpenSlug(item.slug)}
              openLabel={t("openFrame", { title: item.title })}
              frameTbdLabel={t("frameTbd")}
              featuredLabel={t("featured")}
              savedLabel={t("saved")}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            />
          </div>
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
