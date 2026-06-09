import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/content/localize";
import type { Game } from "@/content/schemas";
import { cn, FOCUS_RING } from "@/lib/utils";

// Status → arcade chip tone. The content statuses (ready / draft /
// placeholder / coming-soon) become cabinet labels; ready glows in the
// game accent, the in-progress ones warn, "soon" reads as a locked slot.
const STATUS_TONE: Record<Game["status"], string> = {
  ready: "border-game-accent/50 bg-game-accent/10 text-game-accent",
  draft: "border-warning/50 bg-warning/10 text-warning",
  placeholder: "border-warning/50 bg-warning/10 text-warning",
  "coming-soon": "border-border bg-muted/40 text-muted-foreground",
};

const STATUS_DOT: Record<Game["status"], string> = {
  ready: "bg-game-accent",
  draft: "bg-warning",
  placeholder: "bg-warning",
  "coming-soon": "bg-muted-foreground",
};

// 12px cartridge corner notch (top-right), sm+ only so it never clips
// awkwardly on a narrow phone tile.
const NOTCH =
  "sm:[clip-path:polygon(0_0,calc(100%-13px)_0,100%_13px,100%_100%,0_100%)]";

interface GameCartridgeProps {
  game: Game;
  locale: Locale;
  index: number;
}

/**
 * One game as an arcade cartridge. A notched cabinet frame over a CRT
 * "cover screen" (always-dark, scanlined, accent-glow) with a VT323
 * title and an arcade status chip. The whole tile is the link to the
 * /games/[slug] cabinet; hover powers the screen on.
 */
export async function GameCartridge({ game, locale, index }: GameCartridgeProps) {
  const t = await getTranslations({ locale, namespace: "Game" });
  const tStatus = await getTranslations({ locale, namespace: "Status" });
  const lg = localize(game, locale);
  const cover = game.cover;
  const soon = game.status === "coming-soon";

  return (
    <Link
      href={`/games/${game.slug}`}
      locale={locale}
      aria-label={lg.title as string}
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card text-card-foreground",
        "transition-[transform,border-color,box-shadow] duration-(--motion-medium) ease-(--ease-premium)",
        "hover:border-game-accent/50 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--game-accent)_30%,transparent),0_24px_60px_-30px_color-mix(in_srgb,var(--game-accent)_55%,transparent)] motion-safe:hover:-translate-y-1",
        NOTCH,
        FOCUS_RING,
      )}
    >
      {/* ── Cabinet top bar ── */}
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-1.5">
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="text-game-accent/70">{String(index).padStart(2, "0")}</span>
          {game.engine}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.16em]",
            STATUS_TONE[game.status],
          )}
        >
          <span className={cn("size-1.5 rounded-full", STATUS_DOT[game.status])} />
          {tStatus(game.status)}
        </span>
      </div>

      {/* ── CRT cover screen ── always-dark so scanlines read in both
          themes; powers brighter on hover. ── */}
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border/70 bg-media-well">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            unoptimized={cover.src.endsWith(".svg")}
            className={cn(
              "object-cover grayscale transition duration-500 ease-(--ease-premium) group-hover:grayscale-0 motion-safe:group-hover:scale-[1.04]",
              soon && "opacity-40",
            )}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center px-4 text-center">
            <span className="font-pixel text-lg uppercase leading-none tracking-[0.08em] text-game-accent/70">
              {t("coverTbd")}
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block w-[0.5ch] bg-game-accent/70"
                style={{ animation: "workspace-caret 1.05s steps(1) infinite" }}
              >
                &nbsp;
              </span>
            </span>
          </div>
        )}

        {/* Scanlines — white-based so they read on the dark screen in
            either theme. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen transition-opacity duration-(--motion-medium) group-hover:opacity-70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(255,255,255,0.05) 3px)",
          }}
        />
        {/* Accent bloom from the floor of the screen. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-(--motion-medium) group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 125%, color-mix(in srgb, var(--game-accent) 30%, transparent), transparent 60%)",
          }}
        />
        {/* CRT edge vignette. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset 0 0 48px 8px rgba(0,0,0,0.55)",
          }}
        />

        {/* Power-on prompt — slides in on hover. */}
        <span
          aria-hidden="true"
          className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-sm bg-game-accent px-2 py-0.5 font-pixel text-sm uppercase tracking-[0.06em] text-background opacity-0 transition-[opacity,transform] duration-(--motion-fast) ease-(--ease-premium) translate-y-1 group-hover:translate-y-0 group-hover:opacity-100"
        >
          ▶ {soon ? t("insertCoin") : t("pressStart")}
        </span>
      </div>

      {/* ── Cartridge label ── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-pixel text-2xl uppercase leading-none tracking-[0.02em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-game-accent">
          {lg.title as string}
        </h3>
        <p className="line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">
          {lg.pitch as string}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
            {game.year}
          </span>
          <span className="inline-flex items-center gap-1 font-pixel text-base uppercase tracking-[0.04em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-game-accent">
            {t("view")}
            <span
              aria-hidden="true"
              className="transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:translate-x-0.5"
            >
              ▶
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
