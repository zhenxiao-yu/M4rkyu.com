"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import { TiltedCard } from "@/components/ui/magic/tilted-card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Resource } from "@/content/schemas";
import { cn, FOCUS_RING } from "@/lib/utils";
import { ToolIcon } from "./tool-icon";

interface FeaturedToolsBentoProps {
  tools: Resource[];
  locale: Locale;
}

// Hero spotlight bento. First featured tool gets the large tile with
// TiltedCard + PointerSpotlight + BorderBeam. The next two ride on
// PointerSpotlight only — single BorderBeam per viewport per the UI
// library doctrine (one beam, never two competing).
//
// Falls back to nothing when no featured tools exist (page just opens
// with the explorer below).
export function FeaturedToolsBento({ tools, locale }: FeaturedToolsBentoProps) {
  const t = useTranslations("Resources");
  if (tools.length === 0) return null;
  const [hero, ...rest] = tools;

  return (
    <BlurFade delay={0.05}>
      <section
        aria-labelledby="featured-heading"
        className="grid gap-3 lg:grid-cols-3 lg:auto-rows-[minmax(11rem,1fr)]"
      >
        <header className="lg:col-span-3">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {t("featuredEyebrow")}
          </p>
          <h2 id="featured-heading" className="mt-1 text-lg font-semibold">
            {t("featuredHeading")}
          </h2>
        </header>

        {/* Hero tile */}
        <FeaturedHeroTile resource={hero} locale={locale} label={t("type.tool")} openAria={t("openToolAria", { name: hero.name })} />

        {/* Secondary tiles stack vertically next to the hero on lg+ */}
        <div className="grid gap-3 lg:row-start-2 lg:row-span-2 lg:auto-rows-[minmax(10.5rem,1fr)]">
          {rest.map((resource) => (
            <FeaturedSecondaryTile
              key={resource.slug}
              resource={resource}
              locale={locale}
              label={t("type.tool")}
              openAria={t("openToolAria", { name: resource.name })}
            />
          ))}
        </div>
      </section>
    </BlurFade>
  );
}

function FeaturedHeroTile({
  resource,
  locale,
  label,
  openAria,
}: {
  resource: Resource;
  locale: Locale;
  label: string;
  openAria: string;
}) {
  return (
    <TiltedCard
      maxTilt={5}
      glare={0.35}
      hoverScale={1.01}
      className="lg:col-span-2 lg:row-span-2"
    >
      <Link
        href={`/resources/${resource.slug}`}
        locale={locale}
        aria-label={openAria}
        className={cn(
          "group relative isolate flex h-full min-h-[16rem] flex-col justify-between gap-4 overflow-hidden rounded-lg border border-border bg-card/80 p-6 transition-[border-color] duration-(--motion-fast) ease-(--ease-premium)",
          "hover:border-ring/70",
          FOCUS_RING,
        )}
      >
        <PointerSpotlight radius={520} intensity={0.22} />
        <BorderBeam borderRadius={8} duration={14} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cyber-grid opacity-25"
        />
        <div className="relative z-20 flex items-start justify-between gap-3">
          <span className="grid size-12 place-items-center rounded-md border border-ring/40 bg-background/60 text-ring">
            <ToolIcon
              iconKey={resource.iconKey}
              tags={resource.tags}
              className="size-6"
            />
          </span>
          <Badge variant="success" className="gap-1 font-mono text-[0.6rem] uppercase tracking-[0.18em]">
            <Play aria-hidden="true" className="size-2.5 fill-current" />
            {label}
          </Badge>
        </div>
        <div className="relative z-20 grid gap-2">
          <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {resource.name}
          </h3>
          <p className="max-w-prose text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {resource.description}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="font-mono text-[0.55rem]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="relative z-20 flex items-center gap-2 text-sm text-foreground">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            open
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
          />
        </div>
      </Link>
    </TiltedCard>
  );
}

function FeaturedSecondaryTile({
  resource,
  locale,
  label,
  openAria,
}: {
  resource: Resource;
  locale: Locale;
  label: string;
  openAria: string;
}) {
  return (
    <Link
      href={`/resources/${resource.slug}`}
      locale={locale}
      aria-label={openAria}
      className={cn(
        "group relative isolate flex h-full flex-col justify-between gap-3 overflow-hidden rounded-lg border border-border bg-card/80 p-4 transition-[border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:border-ring/60 motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
      )}
    >
      <PointerSpotlight radius={300} intensity={0.18} />
      <div className="relative z-20 flex items-center justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-md border border-border/70 bg-background/60 text-ring">
          <ToolIcon
            iconKey={resource.iconKey}
            tags={resource.tags}
            className="size-4.5"
          />
        </span>
        <Badge variant="success" className="gap-1 font-mono text-[0.55rem] uppercase tracking-[0.18em]">
          <Play aria-hidden="true" className="size-2.5 fill-current" />
          {label}
        </Badge>
      </div>
      <div className="relative z-20 grid gap-1">
        <h3 className="text-base font-semibold leading-tight">{resource.name}</h3>
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          {resource.description}
        </p>
      </div>
      <ArrowUpRight
        aria-hidden="true"
        className="relative z-20 size-4 self-end text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
      />
    </Link>
  );
}
