"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Code2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import type { GithubStats } from "@/app/api/about/github/route";

// Live GitHub stats — pulls from /api/about/github once per mount. The
// route is ISR-cached 30 min upstream, so this is effectively free.
export function GithubStatsCard({ className }: { className?: string }) {
  const t = useTranslations("About.github");
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/about/github")
      .then((r) => (r.ok ? (r.json() as Promise<GithubStats | null>) : null))
      .then((data) => {
        if (cancelled) return;
        setStats(data ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="grid gap-1">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="size-4" aria-hidden="true" />
            {stats ? `@${stats.handle}` : t("title")}
          </CardTitle>
        </div>
        {stats ? (
          <a
            href={stats.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("openOnGithub")}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              FOCUS_RING_INSET,
            )}
          >
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label={t("repos")} value={stats?.publicRepos} loaded={loaded} />
          <Stat label={t("stars")} value={stats?.totalStars} loaded={loaded} />
          <Stat
            label={t("followers")}
            value={stats?.followers}
            loaded={loaded}
          />
        </div>
        {stats?.topLanguages.length ? (
          <div className="flex flex-wrap gap-1.5">
            {stats.topLanguages.map((lang) => (
              <Badge
                key={lang}
                variant="outline"
                className="font-mono text-[0.6rem]"
              >
                {lang}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  loaded,
}: {
  label: string;
  value: number | undefined;
  loaded: boolean;
}) {
  return (
    <div className="grid gap-1 rounded-md border border-border/60 bg-background/40 p-3">
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-2xl tabular-nums leading-none">
        {loaded ? (value ?? "—") : ""}
      </p>
    </div>
  );
}
