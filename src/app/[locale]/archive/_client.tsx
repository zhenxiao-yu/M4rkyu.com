"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { FrameTile, orderFrames } from "@/components/gallery/frame-tile";
import type { GalleryItem } from "@/content/schemas";

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
  /** Tile style — "card" (default) or "bare" image wall. */
  variant?: "card" | "bare";
  /** Show the keyboard-nav hint strip above the grid. */
  showHint?: boolean;
}

export function GalleryGrid({
  items,
  locale,
  savedSlugs,
  signedIn,
  variant = "card",
  showHint = true,
}: GalleryGridProps) {
  const savedSet = useMemo(() => new Set(savedSlugs), [savedSlugs]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const frame = searchParams.get("frame");
  const t = useTranslations("Gallery");

  const orderedItems = useMemo(() => orderFrames(items), [items]);

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
      {showHint ? (
        <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          {t("hoverHint")}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {orderedItems.map((item) => (
          <FrameTile
            key={item.slug}
            item={item}
            variant={variant}
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
