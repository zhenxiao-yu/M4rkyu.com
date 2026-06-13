import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SystemBadge } from "@/components/ui/pixel/system-badge";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { getGamesSource } from "@/lib/games/source";
import { localize } from "@/lib/content/localize";
import { HomeSection } from "./home-section";
import { SectionActionLink } from "./section-action-link";
import { SectionBackground } from "./section-background";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

const scanlines =
  "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(255,255,255,0.05) 3px)";

/**
 * Games entry-point slide — a "cartridge shelf". Game work is mostly
 * in-progress, so this stays honest: each row carries its real status
 * chip (placeholder / draft / coming-soon) rather than faking a shipped
 * grid, and links into its /games/[slug] lane.
 *
 * Layout intent: distinct from its neighbours without leaving the home
 * design system. Compass is a flat icon list; Selected Work is a
 * horizontal cover rail — so Games is a vertical stack of full-width
 * cartridge bars: an accent label-spine, the canonical SystemBadge, a
 * sans `font-heading` title, and a small CRT mini-screen. Same type
 * ramp + glass surface as the rest of the spine (no pixel font, no
 * horizontal scroll); the arcade flavour lives in the backdrop, the
 * status tone, and the scanlined screen.
 */
export async function GamesPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home.games" });
  const tStatus = await getTranslations({ locale, namespace: "Status" });

  const games = (await getGamesSource()).slice(0, 3);
  if (games.length === 0) return null;

  return (
    <HomeSection
      tone="default"
      dataSection="games"
      background={<SectionBackground variant="arcade" />}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <SectionActionLink
          href="/games"
          locale={locale}
          className="hover:text-game-accent"
        >
          {t("open")}
        </SectionActionLink>
      }
    >
      <Stagger as="ol" className="flex flex-col gap-3 sm:gap-3.5">
        {games.map((game, index) => {
          const lg = localize(game, locale);
          const cover = game.cover;
          return (
            <StaggerItem as="li" key={game.slug}>
              <Link
                href={`/games/${game.slug}`}
                locale={locale}
                aria-label={lg.title as string}
                className={cn(
                  "group relative grid grid-cols-[auto_1fr_auto] items-stretch gap-4 overflow-hidden rounded-lg glass-surface glass-interactive p-3 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-5 sm:p-4",
                  FOCUS_RING,
                )}
              >
                {/* Cartridge spine — accent label edge, index, glyph. */}
                <div className="relative flex w-10 shrink-0 flex-col items-center justify-between gap-2 overflow-hidden rounded-md border border-border/60 bg-background/60 py-2.5 sm:w-12">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1 bg-game-accent/70 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:bg-game-accent"
                  />
                  <span className="font-mono text-xs tabular-nums text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-game-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Gamepad2
                    aria-hidden="true"
                    className="size-3.5 text-muted-foreground/45"
                  />
                </div>

                {/* Build info. */}
                <div className="flex min-w-0 flex-col justify-center gap-1.5 py-0.5">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <SystemBadge
                      status={game.status}
                      label={tStatus(game.status)}
                    />
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                      {game.engine} · {game.year}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold leading-tight transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-game-accent sm:text-xl">
                    {lg.title as string}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {lg.pitch as string}
                  </p>
                </div>

                {/* CRT mini-screen — cover if present, else a scanlined
                  * placeholder. Desktop-only so mobile rows stay compact. */}
                <div className="relative hidden aspect-5/3 w-28 shrink-0 self-center overflow-hidden rounded-md border border-border/60 bg-media-well sm:block lg:w-36">
                  {cover ? (
                    <Image
                      src={cover.src}
                      alt=""
                      fill
                      sizes="9rem"
                      unoptimized={cover.src.endsWith(".svg")}
                      className="object-cover [@media(pointer:fine)]:grayscale transition duration-500 ease-(--ease-premium) [@media(pointer:fine)]:group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-game-accent/60">
                        tbd
                      </span>
                    </div>
                  )}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen"
                    style={{ backgroundImage: scanlines }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-(--motion-medium) group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 50% 125%, color-mix(in srgb, var(--game-accent) 26%, transparent), transparent 60%)",
                    }}
                  />
                </div>

                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 self-center text-muted-foreground/45 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-game-accent"
                />
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </HomeSection>
  );
}
