"use client";

import { useEffect, useRef, useState } from "react";
import { Music2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import type { NowPlaying } from "@/app/api/about/spotify/now-playing/route";

// Polls /api/about/spotify/now-playing every 30s; when env isn't set
// or nothing's playing, the route returns {isPlaying:false} and we
// render a quiet empty state. No PII leaves the server.
const POLL_INTERVAL_MS = 30_000;

type LoadState = "loading" | "ready" | "error";

export function NowPlayingCard({ className }: { className?: string }) {
  const t = useTranslations("About.nowPlaying");
  const [data, setData] = useState<NowPlaying | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/about/spotify/now-playing");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as NowPlaying;
        if (cancelled) return;
        setData(json);
        setLoadState("ready");
      } catch {
        if (cancelled) return;
        setLoadState("error");
      }
    }
    load();
    timerRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loaded = loadState !== "loading";

  const hasTrack = Boolean(data?.track);
  const heading = data?.isPlaying ? t("nowPlaying") : t("recentlyPlayed");

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="space-y-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {hasTrack ? heading : t("title")}
        </p>
        <CardTitle className="flex items-center gap-2 text-base">
          <Music2 className="size-4" aria-hidden="true" />
          <span className="truncate">
            {loadState === "error"
              ? t("loadFailed")
              : loaded
                ? hasTrack
                  ? data?.track
                  : t("notPlaying")
                : t("loading")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {data?.artist ? (
          <p className="truncate text-sm text-muted-foreground">{data.artist}</p>
        ) : null}
        {data?.albumArt && data?.url ? (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              data.track
                ? t("openTrack", { track: data.track })
                : t("openOnSpotify")
            }
            className={cn(
              "block w-fit overflow-hidden rounded-md border border-border/60 transition-[border-color] hover:border-ring/50",
              FOCUS_RING_INSET,
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Spotify CDN host not in next.config.ts remotePatterns; cost of round-trip not worth a 96px album thumb. */}
            <img
              src={data.albumArt}
              alt=""
              loading="lazy"
              width={96}
              height={96}
              className="block size-24 object-cover"
            />
          </a>
        ) : null}
        {data?.isPlaying ? (
          <div className="flex items-center gap-1.5">
            <span className="relative inline-flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-ring opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-ring" />
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {t("live")}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
