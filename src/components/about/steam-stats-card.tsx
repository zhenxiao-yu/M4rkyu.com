"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import type { SteamStats } from "@/app/api/about/steam/route";

type LoadState = "loading" | "ready" | "error";

// Steam personastate → label key on About.steam. We collapse states
// 2/3/4/5/6 into "online" because the granular ones (busy / away /
// looking-to-play) are noisy and rarely useful on a portfolio card.
function statusKey(state: number, inGame: boolean): "inGame" | "online" | "offline" {
  if (inGame) return "inGame";
  if (state >= 1) return "online";
  return "offline";
}

export function SteamStatsCard({ className }: { className?: string }) {
  const t = useTranslations("About.steam");
  const [stats, setStats] = useState<SteamStats | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/about/steam")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as SteamStats | null;
      })
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        setLoadState(data ? "ready" : "error");
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loaded = loadState !== "loading";
  const inGame = Boolean(stats?.currentGame);
  const headlineGame = stats?.currentGame ?? stats?.recentGame;
  const status = stats ? statusKey(stats.personaState, inGame) : "offline";

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="grid gap-1">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gamepad2 className="size-4" aria-hidden="true" />
            <span className="truncate">
              {stats ? stats.persona : t("title")}
            </span>
          </CardTitle>
        </div>
        {stats ? (
          <a
            href={stats.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("openOnSteam")}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              FOCUS_RING_INSET,
            )}
          >
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3">
        {stats ? (
          <div className="flex items-center gap-1.5">
            <span className="relative inline-flex size-1.5">
              {inGame ? (
                <span className="absolute inset-0 animate-ping rounded-full bg-ring opacity-60" />
              ) : null}
              <span
                className={cn(
                  "relative inline-flex size-1.5 rounded-full",
                  status === "offline" ? "bg-muted-foreground/60" : "bg-ring",
                )}
              />
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {t(`status.${status}`)}
            </span>
          </div>
        ) : null}

        {headlineGame ? (
          <div className="grid gap-0.5">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
              {inGame ? t("playingNow") : t("recent")}
            </p>
            <p className="truncate text-sm font-medium">{headlineGame}</p>
            {!inGame && stats?.recentGameHours2w ? (
              <p className="font-mono text-[0.65rem] text-muted-foreground">
                {t("hours2w", { hours: stats.recentGameHours2w })}
              </p>
            ) : null}
          </div>
        ) : null}

        {stats ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge variant="outline" className="font-mono text-[0.6rem]">
              {t("games", { count: stats.totalGames })}
            </Badge>
            <Badge variant="outline" className="font-mono text-[0.6rem]">
              {t("hours", { hours: stats.totalHours })}
            </Badge>
            {stats.level ? (
              <Badge variant="outline" className="font-mono text-[0.6rem]">
                {t("level", { level: stats.level })}
              </Badge>
            ) : null}
          </div>
        ) : null}

        {loadState === "error" && !stats ? (
          <p className="text-xs text-muted-foreground">{t("loadFailed")}</p>
        ) : null}
        {!loaded ? (
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
            {t("loading")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
