import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlurImage } from "@/components/ui/blur-image";
import { Link } from "@/i18n/navigation";
import type { GalleryCollection } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Collection plate — the archive's catalogue card. A portrait `3/4` cover
 * (the iPhone sensor's natural ratio, so real photos seat without a crop)
 * framed like a printer's plate: corner registration marks, a catalogue
 * number (Nº 01), and a display title that the cover desaturates beneath
 * until hover. Featured sets lead with a standing accent edge + pennant —
 * the compact replacement for the old full-bleed featured carousel.
 *
 * Looks intentional with OR without a real cover: empty sets get a designed
 * contact-sheet placeholder with a ghosted catalogue numeral, never a blank.
 * Server component — pure CSS hover, no client runtime.
 */

function focalPosition(focal: GalleryCollection["cover"]["focal"]): string {
  if (focal === "top") return "center top";
  if (focal === "bottom") return "center bottom";
  return "center";
}

function hasRealCover(collection: GalleryCollection): boolean {
  return Boolean(collection.cover?.src?.includes("/storage/"));
}

export interface CollectionPlateProps {
  collection: GalleryCollection;
  /** 1-based catalogue number, shown as `Nº 0n`. */
  index: number;
  countLabel: string;
  enterLabel: string;
  featuredLabel: string;
  locale: Locale;
}

export function CollectionPlate({
  collection,
  index,
  countLabel,
  enterLabel,
  featuredLabel,
  locale,
}: CollectionPlateProps) {
  const cover = hasRealCover(collection) ? collection.cover : null;
  const num = String(index).padStart(2, "0");

  return (
    <Link
      href={`/archive/${collection.slug}`}
      locale={locale}
      aria-label={collection.title}
      className={cn(
        "group relative block aspect-3/4 overflow-hidden rounded-lg border bg-card",
        "transition-[border-color,box-shadow,transform] duration-(--motion-base) ease-(--ease-premium)",
        "hover:shadow-xl motion-safe:hover:-translate-y-1",
        collection.featured
          ? "border-ring/55 shadow-sm"
          : "border-border hover:border-ring",
        FOCUS_RING,
      )}
    >
      {cover ? (
        <BlurImage
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 33vw, 45vw"
          className="object-cover grayscale transition duration-(--motion-medium) ease-(--ease-premium) group-hover:grayscale-0 motion-safe:group-hover:scale-[1.04]"
          style={{ objectPosition: focalPosition(cover.focal) }}
        />
      ) : (
        <>
          <div aria-hidden="true" className="absolute inset-0 contact-sheet opacity-60" />
          {/* Ghosted catalogue numeral — gives empty sets a designed center. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 font-display text-7xl font-bold leading-none tabular-nums text-foreground/10"
          >
            {num}
          </span>
        </>
      )}

      {/* Caption scrim — keeps the title legible over any cover tone. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-background/92 via-background/30 to-background/5"
      />

      {/* Printer's registration marks — accent on hover. */}
      <span aria-hidden="true">
        {[
          "left-2 top-2 border-l border-t",
          "right-2 top-2 border-r border-t",
          "bottom-2 left-2 border-b border-l",
          "bottom-2 right-2 border-b border-r",
        ].map((corner) => (
          <span
            key={corner}
            className={cn(
              "pointer-events-none absolute size-3 border-foreground/35 transition-colors duration-(--motion-base) ease-(--ease-premium) group-hover:border-ring",
              corner,
            )}
          />
        ))}
      </span>

      {/* Top row — catalogue number + featured pennant. */}
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <span className="rounded-sm bg-background/70 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tabular-nums tracking-[0.2em] text-foreground backdrop-blur-sm">
          Nº {num}
        </span>
        {collection.featured ? (
          <Badge variant="signal" className="text-[0.55rem]">
            {featuredLabel}
          </Badge>
        ) : null}
      </div>

      {/* Footer — title, accent rule (wipes in on hover), count + enter. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
        <h3 className="text-balance font-display text-xl font-semibold leading-tight sm:text-2xl">
          {collection.title}
        </h3>
        <span
          aria-hidden="true"
          className="h-px w-8 origin-left scale-x-0 bg-ring transition-transform duration-(--motion-base) ease-(--ease-premium) group-hover:scale-x-100"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {countLabel}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-foreground opacity-0 transition-opacity duration-(--motion-base) ease-(--ease-premium) group-hover:opacity-100 group-focus-visible:opacity-100">
            {enterLabel}
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
            />
          </span>
        </div>
        {collection.mood.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {collection.mood.slice(0, 3).map((mood) => (
              <span
                key={mood}
                className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground"
              >
                #{mood}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
