import { getTranslations } from "next-intl/server";
import { BentoTilt } from "@/components/ui/magic/bento-tilt";
import { profile } from "@/content/profile";
import { getPosts } from "@/lib/blog/get-posts";
import type { Locale } from "@/i18n/routing";

interface HeroSpecsStripProps {
  locale: Locale;
}

/**
 * Four-cell metric strip that sits at the bottom of the hero. Each
 * cell wraps in `<BentoTilt>` — the cursor-relative tilt primitive
 * ported from adrianhajdin/award-winning-website. Real values:
 *
 *   1. `BASED IN`        ← `profile.location`
 *   2. `LATEST DEVLOG`   ← most-recent dev.to post date (cached)
 *   3. `PRACTICE`        ← first two of `profile.values`, `·`-joined
 *   4. `STATUS`          ← static "Open for collaboration" + EQ bars
 *
 * Server component — no client JS for the labels/values. The
 * `BentoTilt` wrapper is a thin client island per cell.
 *
 * `<dl>` semantics: each pair is `<dt>` (label) + `<dd>` (value) so
 * screen readers announce the relationship correctly.
 */
export async function HeroSpecsStrip({ locale }: HeroSpecsStripProps) {
  const t = await getTranslations({ locale, namespace: "Home.hero.specs" });
  const posts = await getPosts();
  const latest = posts[0];

  const latestText = latest
    ? `${latest.date} · ${latest.readingTime}`
    : t("latestFallback");

  const practiceText = profile.values.slice(0, 2).join(" · ");

  const cells: ReadonlyArray<{
    key: string;
    label: string;
    value: React.ReactNode;
  }> = [
    {
      key: "location",
      label: t("locationLabel"),
      value: profile.location,
    },
    {
      key: "latest",
      label: t("latestLabel"),
      value: latestText,
    },
    {
      key: "practice",
      label: t("practiceLabel"),
      value: practiceText,
    },
    {
      key: "status",
      label: t("statusLabel"),
      value: (
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-end gap-0.5 text-ring" aria-hidden="true">
            <span className="eq-bar" style={{ ["--eq-order" as never]: 0 }} />
            <span className="eq-bar" style={{ ["--eq-order" as never]: 1 }} />
            <span className="eq-bar" style={{ ["--eq-order" as never]: 2 }} />
          </span>
          <span>{t("statusOpen")}</span>
        </span>
      ),
    },
  ];

  return (
    <dl
      data-boot="specs"
      className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
    >
      {cells.map((cell) => (
        <BentoTilt
          key={cell.key}
          className="rounded-xl border border-border/60 bg-background/55 px-4 py-3 backdrop-blur-md"
        >
          <dt className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            {cell.label}
          </dt>
          <dd className="mt-1.5 truncate text-sm font-medium text-foreground sm:text-[0.95rem]">
            {cell.value}
          </dd>
        </BentoTilt>
      ))}
    </dl>
  );
}
