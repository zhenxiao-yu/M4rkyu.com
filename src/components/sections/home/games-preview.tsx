import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BentoFx, BentoGrid } from "@/components/about/bento-fx";
import { SystemBadge } from "@/components/ui/pixel/system-badge";
import { getGamesSource } from "@/lib/games/source";
import { localize } from "@/lib/content/localize";
import { HomeSection } from "./home-section";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

/**
 * Games entry-point slide. Game content is mostly in-progress, so this
 * reads as an honest "what's on the bench" preview — status badges tell
 * the truth (placeholder / draft / coming-soon) rather than faking a
 * shipped grid. Each card deep-links into its /games/[slug] lane.
 */
export async function GamesPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home.games" });
  const tStatus = await getTranslations({ locale, namespace: "Status" });
  const games = (await getGamesSource()).slice(0, 3);

  return (
    <HomeSection
      tone="default"
      dataSection="games"
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <Link
          href="/games"
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
      <BentoGrid className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {games.map((game) => {
          const lg = localize(game, locale);
          return (
            <BentoFx key={game.slug} pattern="cyber-grid" className="h-full">
              <Link
                href={`/games/${game.slug}`}
                locale={locale}
                className={cn(
                  "group relative flex h-full flex-col gap-3 rounded-lg border border-border/70 bg-card/60 p-5 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
                  FOCUS_RING,
                )}
              >
                {/* Cartridge spine — echoes MissionModuleCard. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-muted transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:bg-ring/60"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  <SystemBadge status={game.status} label={tStatus(game.status)} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {game.engine}
                  </span>
                </div>
                <h3 className="flex items-baseline gap-1 font-heading text-lg font-semibold leading-tight">
                  {lg.title as string}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3.5 self-center text-muted-foreground/50 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
                  />
                </h3>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {lg.pitch as string}
                </p>
              </Link>
            </BentoFx>
          );
        })}
      </BentoGrid>
    </HomeSection>
  );
}
