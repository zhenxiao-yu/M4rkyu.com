import { ArrowUpRight, Briefcase, Gamepad2, BookOpen, Wrench, User, Image as ImageIcon, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BentoFx, BentoGrid, type BentoPattern } from "@/components/about/bento-fx";
import { cn, FOCUS_RING } from "@/lib/utils";
import { HomeSection } from "./home-section";
import type { Locale } from "@/i18n/routing";

interface CompassSectionProps {
  locale: Locale;
}

interface CompassTile {
  id: string;
  number: string;
  href: string;
  icon: LucideIcon;
  pattern: BentoPattern;
}

// Patterns rotate across the rail so the grid has texture without
// reading as noise — mirrors the about-page bento vocabulary.
const TILES: CompassTile[] = [
  { id: "work", number: "01", href: "/work", icon: Briefcase, pattern: "cyber-grid" },
  { id: "games", number: "02", href: "/games", icon: Gamepad2, pattern: "dots" },
  { id: "archive", number: "03", href: "/archive", icon: ImageIcon, pattern: "diag" },
  { id: "logs", number: "04", href: "/logs", icon: BookOpen, pattern: "scanline" },
  { id: "resources", number: "05", href: "/resources", icon: Wrench, pattern: "dots" },
  { id: "about", number: "06", href: "/about", icon: User, pattern: "radial" },
];

export async function CompassSection({ locale }: CompassSectionProps) {
  const t = await getTranslations({ locale, namespace: "Home.compass" });

  return (
    <HomeSection tone="default" dataSection="compass">
      <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        {/* Left — editorial intro. */}
        <div className="max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-heading text-balance text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            {t("heading")}
          </h2>
          <p className="mt-5 text-base leading-7 text-foreground/85">
            {t("body")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <span aria-hidden="true">↓</span>
              {t("cta")}
            </span>
          </div>
        </div>

        {/* Right — tile rail. BentoGrid drives the staggered reveal;
          * each tile wears a BentoFx pattern + cursor spotlight + glow. */}
        <BentoGrid className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:gap-3">
          {TILES.map((tile) => (
            <BentoFx key={tile.id} pattern={tile.pattern} className="h-full">
              <Link
                href={tile.href}
                locale={locale}
                className={cn(
                  "group relative flex h-full items-start gap-3 rounded-lg glass-surface glass-interactive p-4",
                  FOCUS_RING,
                )}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border border-border/60 bg-background/80 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/50 group-hover:text-foreground"
                >
                  <tile.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground/80">
                      {tile.number}
                    </span>
                    <h3 className="font-heading text-base font-semibold leading-tight">
                      {t(`tiles.${tile.id}.label`)}
                    </h3>
                  </div>
                  <p className="mt-1 text-[0.78rem] leading-snug text-muted-foreground">
                    {t(`tiles.${tile.id}.description`)}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground/70 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
                />
              </Link>
            </BentoFx>
          ))}
        </BentoGrid>
      </div>
    </HomeSection>
  );
}
