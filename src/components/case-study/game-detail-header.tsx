import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import type { Game } from "@/content/schemas";

interface GameDetailHeaderProps {
  game: Game;
  /**
   * Localized fields. Pass values from `localize(game, locale)` so the
   * header reads in the active locale when `game.translations[locale]`
   * is set; falls back to the base game fields otherwise.
   */
  title: string;
  pitch: string;
  role: string;
}

/**
 * Mirrors `CaseStudyHeader`'s visual shape (cyber-grid hero +
 * eyebrow row + display title + lede + meta ribbon) but reads
 * game-specific fields: engine, year, role, platforms, build links.
 */
export async function GameDetailHeader({
  game,
  title,
  pitch,
  role,
}: GameDetailHeaderProps) {
  const t = await getTranslations("CaseStudy");
  const tGame = await getTranslations("Game");
  const tProjects = await getTranslations("Projects");

  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-cyber-grid opacity-30" aria-hidden="true" />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Link
          href="/games"
          className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {tGame("gamesIndex")}
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{game.engine}</Badge>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {game.year}
          </span>
          {game.status !== "ready" ? <DraftBadge label={game.status} /> : null}
        </div>

        <h1 className="mt-6 max-w-5xl text-balance font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-tight">
          {title}
        </h1>

        <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
          {pitch}
        </p>

        <dl className="mt-10 grid gap-6 border-t pt-6 sm:grid-cols-[auto_1fr] sm:gap-x-10">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {tProjects("role")}
          </dt>
          <dd className="text-sm leading-7 text-foreground">{role}</dd>

          {game.platforms.length > 0 ? (
            <>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                {tGame("platforms")}
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {game.platforms.map((item) => (
                  <Badge key={item} variant="outline" className="text-[0.65rem]">
                    {item}
                  </Badge>
                ))}
              </dd>
            </>
          ) : null}

          {game.buildLinks.length > 0 ? (
            <>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                {t("links")}
              </dt>
              <dd className="flex flex-wrap gap-2">
                {game.buildLinks.map((link, index) => (
                  <Button
                    key={`${index}-${link.url}`}
                    asChild
                    size="sm"
                    variant={index === 0 ? "default" : "outline"}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  </Button>
                ))}
              </dd>
            </>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
