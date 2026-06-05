import { getTranslations } from "next-intl/server";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BentoFx, BentoGrid, type BentoPattern } from "@/components/about/bento-fx";
import { profile } from "@/content/profile";
import { HomeSection } from "./home-section";
import { SectionBackground } from "./section-background";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

const tileBase =
  "relative flex h-full flex-col gap-3 rounded-lg glass-surface p-4 sm:p-5";
const tileLabel =
  "font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground";

function Tile({
  pattern,
  span,
  children,
}: {
  pattern: BentoPattern;
  span?: string;
  children: React.ReactNode;
}) {
  return (
    <BentoFx pattern={pattern} spotlight={false} className={cn("h-full", span)}>
      <div className={tileBase}>{children}</div>
    </BentoFx>
  );
}

/**
 * About entry-point slide — a compact dashboard drawn entirely from
 * `profile` (no fake metrics): the live "currently" feed, a real
 * places stat, the values list, and the core stack. Drops into the
 * full /about bento.
 */
export async function AboutPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home.aboutPreview" });

  const cityCount = profile.cities.length;
  const countryCount = new Set(profile.cities.map((c) => c.country)).size;
  const values = profile.values.slice(0, 4);
  const stack = profile.skills.slice(0, 8);

  return (
    <HomeSection
      tone="default"
      dataSection="about-preview"
      background={<SectionBackground variant="contour" />}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <Link
          href="/about"
          locale={locale}
          className={cn(
            "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring",
            FOCUS_RING,
          )}
        >
          {t("open")}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
    >
      <BentoGrid className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {/* Currently feed. */}
        <Tile pattern="dots" span="col-span-2">
          <span className={tileLabel}>{t("currentlyLabel")}</span>
          <ul className="grid gap-2.5">
            {profile.currently.map((entry) => (
              <li key={entry.label} className="flex items-baseline gap-3">
                <span className="w-20 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ring/80">
                  {t(`kinds.${entry.kind}`)}
                </span>
                <span className="min-w-0 flex-1 text-sm leading-6 text-foreground/90">
                  {entry.label}
                </span>
              </li>
            ))}
          </ul>
        </Tile>

        {/* Places stat. */}
        <Tile pattern="radial">
          <span className={tileLabel}>
            <MapPin aria-hidden="true" className="mr-1 inline size-3" />
            {profile.location}
          </span>
          <p className="font-display text-4xl font-black leading-none tracking-tight">
            {cityCount}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("placesLabel", { cities: cityCount, countries: countryCount })}
          </p>
        </Tile>

        {/* Values. */}
        <Tile pattern="diag">
          <span className={tileLabel}>{t("valuesLabel")}</span>
          <ul className="grid gap-1.5 text-sm leading-6 text-foreground/90">
            {values.map((value) => (
              <li key={value} className="flex items-baseline gap-2">
                <span aria-hidden="true" className="text-ring">
                  ·
                </span>
                {value}
              </li>
            ))}
          </ul>
        </Tile>

        {/* Core stack. */}
        <Tile pattern="scanline" span="col-span-2">
          <span className={tileLabel}>{t("stackLabel")}</span>
          <ul className="flex flex-wrap gap-1.5">
            {stack.map((skill) => (
              <li
                key={skill.label}
                className="rounded-md border border-border/60 bg-background/50 px-2.5 py-1 font-mono text-[0.7rem] text-muted-foreground"
              >
                {skill.label}
              </li>
            ))}
          </ul>
        </Tile>
      </BentoGrid>
    </HomeSection>
  );
}
