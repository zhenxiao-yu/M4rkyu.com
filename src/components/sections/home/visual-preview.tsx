import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/ui/magic/carousel";
import { DotGrid } from "@/components/ui/magic/dot-grid";
import type { GalleryCollection } from "@/content/schemas";
import { getGallerySource } from "@/lib/gallery/source";
import { HomeSection } from "./home-section";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

const actionLink =
  "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring";

/**
 * Visual entry-point slide — the gallery's front door. One collection
 * is featured at a time inside an auto-rotating Carousel (pause on
 * hover, reduced-motion safe, prev/next + dots). The featured panel is
 * height-capped so the whole slide stays within a single viewport on
 * mobile and desktop alike.
 */
export async function VisualPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home.visual" });
  const { collections } = await getGallerySource();
  const covers = collections.slice(0, 4);

  return (
    <HomeSection
      tone="default"
      dataSection="visual"
      className="overflow-hidden"
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/archive" locale={locale} className={cn(actionLink, FOCUS_RING)}>
            {t("openArchive")}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
          <Link href="/media" locale={locale} className={cn(actionLink, FOCUS_RING)}>
            {t("openMedia")}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      }
    >
      {/* Interactive dot field behind the rotator. */}
      <DotGrid
        className="-z-10"
        spacing={34}
        baseDotSize={1}
        hoverDotSize={3.4}
        influenceRadius={150}
        baseOpacity={0.16}
      />

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
                frames: t("framesCount", { count: collection.count }),
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
  return (
    <div className="grid overflow-hidden rounded-xl border bg-card/60 md:h-[clamp(18rem,44vh,28rem)] md:grid-cols-2">
      {/* Cover. */}
      <div className="relative aspect-16/10 overflow-hidden bg-muted md:aspect-auto md:h-full">
        <Image
          src={collection.cover.src}
          alt={collection.cover.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover grayscale transition duration-500 ease-(--ease-premium) hover:grayscale-0"
        />
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
