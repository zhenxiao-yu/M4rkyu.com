"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Code2, Gamepad2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/ui/magic/count-up";
import { cn, FOCUS_RING_INSET, PANEL_WELL, PANEL_TILE } from "@/lib/utils";
import type { GithubStats } from "@/app/api/about/github/route";
import type { SteamStats } from "@/app/api/about/steam/route";

type LoadState<T> = {
  status: "loading" | "ready" | "error";
  data: T | null;
};

function steamStatus(state: number, inGame: boolean) {
  if (inGame) return "inGame";
  if (state >= 1) return "online";
  return "offline";
}

export function AboutSignalsCard({
  bare = false,
}: {
  /** Render just the GitHub + Steam feeds — no Card chrome or header. Used
   * when an outer shell (the dossier TELEMETRY panel) supplies the framing. */
  bare?: boolean;
}) {
  const t = useTranslations("About.signals");
  const steamT = useTranslations("About.steam");
  const locale = useLocale();
  const [github, setGithub] = useState<LoadState<GithubStats>>({
    status: "loading",
    data: null,
  });
  const [steam, setSteam] = useState<LoadState<SteamStats>>({
    status: "loading",
    data: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/about/github")
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as GithubStats | null;
      })
      .then((data) => {
        if (!cancelled) {
          setGithub(data ? { status: "ready", data } : { status: "error", data: null });
        }
      })
      .catch(() => {
        if (!cancelled) setGithub({ status: "error", data: null });
      });

    fetch("/api/about/steam")
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as SteamStats | null;
      })
      .then((data) => {
        if (!cancelled) {
          setSteam(data ? { status: "ready", data } : { status: "error", data: null });
        }
      })
      .catch(() => {
        if (!cancelled) setSteam({ status: "error", data: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const inGame = Boolean(steam.data?.currentGame);
  const game = steam.data?.currentGame ?? steam.data?.recentGame;
  const status = steam.data ? steamStatus(steam.data.personaState, inGame) : null;
  const githubLanguageMix = github.data?.languageBytes.length
    ? github.data.languageBytes.slice(0, 4).map((item) => item.name)
    : github.data?.topLanguages;

  const sections = (
    <>
        <section className={cn(PANEL_WELL, "p-4")}>
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Code2 className="size-4 text-ring" aria-hidden="true" />
                {github.data ? `@${github.data.handle}` : t("github")}
              </p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {github.status === "loading" ? t("syncing") : github.data ? t("public") : t("quiet")}
              </p>
            </div>
            {github.data ? (
              <a
                href={github.data.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("openGithub")}
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  FOCUS_RING_INSET,
                )}
              >
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <SignalStat label={t("repos")} value={github.data?.publicRepos} />
            <SignalStat label={t("stars")} value={github.data?.totalStars} />
            <SignalStat label={t("followers")} value={github.data?.followers} />
          </div>
          <div className="mt-4 grid gap-3">
            <div className={cn(PANEL_TILE, "p-3")}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {t("recently")}
                </p>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {github.data?.recentCommitCount ?? 0} {t("commits")}
                </p>
              </div>
              <Sparkline values={github.data?.weeklyCommits ?? []} />
              {github.data?.recentlyActiveRepos.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {github.data.recentlyActiveRepos.map((repo) => (
                    <Badge key={repo} variant="outline" className="max-w-full truncate font-mono text-[0.58rem]">
                      {repo}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("noActivity")}
                </p>
              )}
            </div>
            {githubLanguageMix?.length ? (
              <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("languages")}: {githubLanguageMix.join(" / ")}
              </p>
            ) : null}
            {github.data?.latestActivityAt ? (
              <p className="text-xs text-muted-foreground">
                {t("lastActive")}: {formatDate(github.data.latestActivityAt, locale)}
              </p>
            ) : null}
          </div>
        </section>

        <section className={cn(PANEL_WELL, "p-4")}>
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                {steam.data?.avatar ? (
                  <Image
                    src={steam.data.avatar}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded-sm"
                    unoptimized
                  />
                ) : (
                  <Gamepad2 className="size-4 text-ring" aria-hidden="true" />
                )}
                {steam.data?.persona ?? t("steam")}
              </p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {steam.status === "loading"
                  ? t("syncing")
                  : status
                    ? steamT(`status.${status}`)
                    : t("quiet")}
              </p>
            </div>
            {steam.data ? (
              <a
                href={steam.data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("openSteam")}
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  FOCUS_RING_INSET,
                )}
              >
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
          {game ? (
            <div className="mt-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {inGame ? steamT("playingNow") : steamT("recent")}
              </p>
              <p className="mt-1 truncate text-sm font-medium">{game}</p>
            </div>
          ) : null}

          {steam.data?.recentGames.length ? (
            <div className="mt-4 grid gap-1.5">
              {steam.data.recentGames.map((recent) => (
                <div
                  key={recent.name}
                  className={cn(PANEL_TILE, "flex min-w-0 items-center justify-between gap-3 px-3 py-2")}
                >
                  <span className="min-w-0 truncate text-xs font-medium">
                    {recent.name}
                  </span>
                  <span className="shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {recent.hours2w}h
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t("noGame")}</p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <SignalStat label={t("games")} value={steam.data?.totalGames} />
            <SignalStat label={t("level")} value={steam.data?.level} />
            <SignalStat label={t("hours")} value={steam.data?.totalHours} />
          </div>
        </section>
    </>
  );

  if (bare) {
    return <div className="grid gap-3 md:grid-cols-2">{sections}</div>;
  }

  return (
    <Card className="h-full bg-card/85">
      <CardHeader>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">{sections}</CardContent>
    </Card>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const points = values.length ? values : Array.from({ length: 8 }, () => 0);
  const max = Math.max(...points, 1);
  const width = 112;
  const height = 26;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const path = points
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / max) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-2 h-7 w-full text-ring"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function SignalStat({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className={cn(PANEL_TILE, "px-3 py-2")}>
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl leading-none tabular-nums">
        {typeof value === "number" ? <CountUp value={value} /> : "—"}
      </p>
    </div>
  );
}
