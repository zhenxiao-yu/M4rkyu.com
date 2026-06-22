import {
  ArrowUpRight,
  Briefcase,
  Gamepad2,
  BookOpen,
  Wrench,
  User,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { cn, FOCUS_RING } from "@/lib/utils";
import { HomeSection } from "./home-section";
import { SectionBackground } from "./section-background";
import { SectionEyebrow } from "./section-eyebrow";
import type { Locale } from "@/i18n/routing";

interface CompassSectionProps {
  locale: Locale;
}

interface Route {
  id: string;
  href: string;
  icon: LucideIcon;
}

// Each destination reads as a heading on the manifest; the catalog index
// (01…06) carries the departure-board rhythm.
const ROUTES: Route[] = [
  { id: "work", href: "/work", icon: Briefcase },
  { id: "games", href: "/games", icon: Gamepad2 },
  { id: "archive", href: "/archive", icon: ImageIcon },
  { id: "logs", href: "/logs", icon: BookOpen },
  { id: "resources", href: "/resources", icon: Wrench },
  { id: "about", href: "/about", icon: User },
];

/**
 * Compass — the site's orientation map, redrawn as a wayfinding
 * console. The left rail is a tight editorial intro (eyebrow → heading →
 * body → one prompt line); the right is a single frosted "manifest"
 * panel whose rows are uniform-height route entries.
 *
 * Why a manifest, not a tile grid: the old 2-up tiles sized to their
 * copy and came out ragged, and read as generic cards. A console of
 * equal rows guarantees rhythm, scans like a departure board, and the
 * hover language (accent bar grows, label slides) is pure CSS — no
 * client JS, reduced-motion + touch safe.
 */
export async function CompassSection({ locale }: CompassSectionProps) {
  const t = await getTranslations({ locale, namespace: "Home.compass" });

  return (
    <HomeSection
      tone="default"
      dataSection="compass"
      background={<SectionBackground variant="radar" />}
    >
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-14">
        {/* Left rail — tight editorial intro. */}
        <FadeIn className="flex flex-col">
          <SectionEyebrow>{t("eyebrow")}</SectionEyebrow>
          <h2 className="mt-4 font-heading text-balance text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            {t("heading")}
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-foreground/85">
            {t("body")}
          </p>

          {/* One quiet prompt line — same at every breakpoint. */}
          <p className="mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden="true" className="text-ring">
              →
            </span>
            {t("cta")}
          </p>
        </FadeIn>

        {/* Right — wayfinding manifest. One frosted instrument panel;
          * rows divide with hairlines and reveal top-down. */}
        <Stagger
          as="ol"
          className="relative flex flex-col self-start overflow-hidden rounded-xl glass-surface"
        >
          {/* Manifest header strip — a console label, not a card title. */}
          <li
            aria-hidden="true"
            className="flex items-center justify-between border-b border-border/50 px-4 py-2.5 sm:px-5"
          >
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground/70">
              {t("eyebrow")}
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground/50">
              {String(ROUTES.length).padStart(2, "0")} ／ dest
            </span>
          </li>

          {ROUTES.map((route, index) => (
            <StaggerItem key={route.id} as="li">
              <Link
                href={route.href}
                locale={locale}
                className={cn(
                  "group relative grid w-full grid-cols-[1.5rem_auto_1fr_auto] items-center gap-3 px-4 py-4 transition-colors duration-(--motion-fast) ease-(--ease-premium) sm:grid-cols-[1.75rem_auto_1fr_auto] sm:gap-5 sm:px-5 sm:py-[1.15rem]",
                  index > 0 && "border-t border-border/50",
                  "hover:bg-ring/[0.05] active:bg-ring/[0.08]",
                  FOCUS_RING,
                )}
              >
                {/* Left accent bar — grows from the floor on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 origin-bottom scale-y-0 bg-ring transition-transform duration-(--motion-medium) ease-(--ease-premium) group-hover:scale-y-100"
                />

                {/* Catalog index. */}
                <span className="font-mono text-sm tabular-nums text-muted-foreground/70 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Glyph chip — lifts a soft accent halo on hover. */}
                <span
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-md border border-border/60 bg-background/70 text-muted-foreground transition-[color,border-color,box-shadow] duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/50 group-hover:text-foreground group-hover:shadow-[0_0_16px_-4px_var(--ring)]"
                >
                  <route.icon className="size-4" />
                </span>

                {/* Destination + descriptor. Slides right on hover. */}
                <div className="min-w-0 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:translate-x-1">
                  <h3 className="font-heading text-base font-semibold leading-tight sm:text-lg">
                    {t(`tiles.${route.id}.label`)}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-[0.8rem] leading-snug text-muted-foreground">
                    {t(`tiles.${route.id}.description`)}
                  </p>
                </div>

                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground/45 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
                />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </HomeSection>
  );
}
