"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { DotGrid } from "@/components/ui/magic/dot-grid";
import { HomeSection } from "./home-section";
import { SectionActionLink } from "./section-action-link";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface FrameData {
  year: string;
  captionKey: string;
  /** Optional real image; falls back to placeholder when missing. */
  src?: string;
  alt?: string;
}

const FRAMES: FrameData[] = [
  { year: "2003", captionKey: "firstComputer" },
  { year: "2008", captionKey: "firstGame" },
  { year: "2013", captionKey: "moveToCanada" },
  { year: "2017", captionKey: "westernUniversity" },
  { year: "2022", captionKey: "jdPower" },
  { year: "2024", captionKey: "firstFilm" },
  { year: "2025", captionKey: "openingTheArchive" },
  { year: "2026", captionKey: "now" },
];

interface FramesGalleryProps {
  locale: Locale;
}

/**
 * Chronological journey strip — "How I got here". Editorial timeline
 * via the shared HomeSection shell.
 *
 *   - Year is a large display number anchored to the copy column.
 *   - Frame images alternate left/right across rows on md+, stack on
 *     mobile (image then copy).
 *   - Single-shot scroll reveal per row (`whileInView once`) — no
 *     per-frame parallax wobble.
 *   - Real images go in `public/journey/` + update the FRAMES array
 *     (or later, lift FRAMES into `src/content/journey.ts`).
 */
export function FramesGallery({ locale }: FramesGalleryProps) {
  const t = useTranslations("Home.frames");
  return (
    <HomeSection
      tone="default"
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <SectionActionLink href="/archive" locale={locale}>
          {t("openArchive")}
        </SectionActionLink>
      }
      dataSection="frames"
      className="overflow-hidden"
    >
      <DotGrid
        className="-z-10"
        spacing={36}
        baseDotSize={1}
        hoverDotSize={3.2}
        influenceRadius={140}
        baseOpacity={0.14}
      />
      <ol className="grid gap-14 md:gap-20">
        {FRAMES.map((frame, i) => (
          <Frame
            key={frame.year}
            frame={frame}
            index={i}
            caption={t(frame.captionKey)}
          />
        ))}
      </ol>
    </HomeSection>
  );
}

function Frame({
  frame,
  index,
  caption,
}: {
  frame: FrameData;
  index: number;
  caption: string;
}) {
  const reduce = useReducedMotion();
  const isEven = index % 2 === 0;
  const isPlaceholder = !frame.src;

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        "relative grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr] md:gap-12",
        !isEven && "md:[&>*:first-child]:order-2",
      )}
    >
      <div className="relative">
        {isPlaceholder ? (
          <PlaceholderImage
            label="JOURNEY FRAME · PLACEHOLDER"
            aspect="aspect-4/5"
            className="w-full"
          />
        ) : (
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-md border bg-muted">
            <Image
              src={frame.src!}
              alt={frame.alt ?? caption}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[clamp(3rem,7vw,5.5rem)] font-bold leading-none tracking-tight text-foreground/85">
            {frame.year}
          </span>
          {isPlaceholder ? (
            <Badge
              variant="warning"
              className="font-mono text-[0.55rem] uppercase tracking-[0.22em]"
            >
              tbd
            </Badge>
          ) : null}
        </div>
        <p className="mt-5 max-w-md text-base leading-7 text-foreground/85">
          {caption}
        </p>
      </div>
    </motion.li>
  );
}
