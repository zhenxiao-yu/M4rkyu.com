import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/ui/magic/carousel";
import type { GalleryCollection } from "@/content/schemas";
import { getGallerySource } from "@/lib/gallery/source";
import { HomeSection } from "./home-section";
import { SectionActionLink } from "./section-action-link";
import { SectionBackground } from "./section-background";
import type { Locale } from "@/i18n/routing";

/**
 * Visual entry-point slide — the gallery's front door. One collection
 * is featured at a time inside an auto-rotating Carousel (pause on
 * hover, reduced-motion safe, prev/next + dots). The featured panel is
 * height-capped so the whole slide stays within a single viewport on
 * mobile and desktop alike.
 */
export async function VisualPreview({
  locale,
  embedded = false,
}: {
  locale: Locale;
  embedded?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "Home.visual" });
  const { collections, items } = await getGallerySource();
  const covers = collections.slice(0, 4);
  // Honest per-collection frame count, derived from real items.
  const countByCollection = items.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.collection] = (acc[item.collection] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <HomeSection
      embedded={embedded}
      tone="default"
      dataSection="visual"
      className="overflow-hidden"
      background={<SectionBackground variant="aperture" />}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <SectionActionLink href="/archive" locale={locale}>
          {t("openArchive")}
        </SectionActionLink>
      }
    >
      {covers.length > 0 ? (
        <Carousel
          ariaLabel={t("galleryAria")}
          controlLabels={{ prev: t("prev"), next: t("next") }}
          slideLabels={covers.map((c) => c.title)}
          autoplayDelay={5500}
        >
          {covers.map((collection, i) => (
            <CollectionSlide
              key={collection.slug}
              collection={collection}
              locale={locale}
              position={i + 1}
              total={covers.length}
              labels={{
                collection: t("collectionLabel"),
                open: t("openCollection"),
                frames: t("framesCount", {
                  count: countByCollection[collection.slug] ?? 0,
                }),
              }}
            />
          ))}
        </Carousel>
      ) : (
        <div className="grid place-items-center rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            {t("framesSoon")}
          </p>
        </div>
      )}
    </HomeSection>
  );
}

/** A cover is displayable only once a real frame is uploaded (lives under
 * /storage/). The per-slug `/gallery/<slug>.svg` placeholders don't exist for
 * every collection, so anything else falls back to a designed placeholder
 * rather than a 404'd <img>. Mirrors the archive plate's `hasRealCover`. */
function hasRealCover(collection: GalleryCollection): boolean {
  return Boolean(collection.cover?.src?.includes("/storage/"));
}

function CollectionSlide({
  collection,
  locale,
  position,
  total,
  labels,
}: {
  collection: GalleryCollection;
  locale: Locale;
  position: number;
  total: number;
  labels: { collection: string; open: string; frames: string };
}) {
  const cover = hasRealCover(collection) ? collection.cover : null;
  const num = String(position).padStart(2, "0");

  return (
    <div className="grid overflow-hidden rounded-xl border bg-card/60 md:h-[clamp(18rem,44vh,28rem)] md:grid-cols-2">
      {/* Cover — a real uploaded frame, else a designed contact-sheet
          placeholder (never a broken image). */}
      <div className="relative aspect-16/10 overflow-hidden bg-muted md:aspect-auto md:h-full">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover [@media(pointer:fine)]:grayscale transition duration-500 ease-(--ease-premium) [@media(pointer:fine)]:hover:grayscale-0"
          />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 contact-sheet opacity-60"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-6xl font-bold leading-none tabular-nums text-foreground/10"
            >
              {num}
            </span>
          </>
        )}
      </div>

      {/* Meta. */}
      <div className="flex flex-col justify-center gap-3 p-5 sm:p-8">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {labels.collection} · {position}/{total}
        </span>
        <h3 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">
          {collection.title}
        </h3>
        <p className="line-clamp-2 max-w-md text-sm leading-6 text-muted-foreground sm:line-clamp-3">
          {collection.description}
        </p>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ring/80">
          {labels.frames}
        </span>
        <div className="pt-1">
          <Button asChild variant="outline" size="sm">
            <Link href={`/archive/${collection.slug}`} locale={locale}>
              {labels.open}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
