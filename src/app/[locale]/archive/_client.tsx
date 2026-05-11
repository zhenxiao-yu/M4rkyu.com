"use client";

import Image from "next/image";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox";
import type { GalleryItem } from "@/content/schemas";
import { cn } from "@/lib/utils";

interface GalleryGridProps {
  items: GalleryItem[];
  locale: string;
}

export function GalleryGrid({ items, locale }: GalleryGridProps) {
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

  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {orderedItems.map((item) => (
          <button
            key={item.slug}
            onClick={() => setOpenSlug(item.slug)}
            className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            type="button"
            aria-label={t("openFrame", { title: item.title })}
          >
            <Card className="overflow-hidden bg-card/80 transition-[border-color,box-shadow] duration-200 group-hover:border-ring group-hover:shadow-md">
              <FrameThumb item={item} frameTbdLabel={t("frameTbd")} />
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.type}</Badge>
                  {item.featured ? (
                    <Badge variant="signal" className="text-[0.6rem]">
                      {t("featured")}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="text-base leading-tight">
                  {item.title}
                </CardTitle>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>

      <GalleryLightbox
        items={orderedItems}
        openSlug={frame}
        locale={locale}
        onChange={setOpenSlug}
      />
    </>
  );
}

function FrameThumb({
  item,
  frameTbdLabel,
}: {
  item: GalleryItem;
  frameTbdLabel: string;
}) {
  const aspect = aspectClass(item.aspect);
  if (item.src) {
    return (
      <div className={cn("relative overflow-hidden border-b bg-muted", aspect)}>
        <Image
          src={item.src.src}
          alt={item.src.alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover grayscale transition duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
        />
      </div>
    );
  }
  return (
    <PlaceholderImage
      label={frameTbdLabel}
      aspect={aspect}
      className="rounded-none border-0 border-b"
    />
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
