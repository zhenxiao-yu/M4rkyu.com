import { MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Radar-style travel map. Sparse dot-grid backdrop with equator +
// tropics lines for orientation; cities project equirectangularly and
// connect in visit order with a dotted polyline. No external map data
// — matches the site's restrained, slightly cyber-pixel aesthetic.

const WIDTH = 600;
const HEIGHT = 320;
const PADDING = 12;

function project(lat: number, lng: number) {
  // Equirectangular projection, padded by PADDING px on every edge.
  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;
  const x = PADDING + ((lng + 180) / 360) * innerWidth;
  const y = PADDING + ((90 - lat) / 180) * innerHeight;
  return { x, y };
}

export async function TravelMapCard({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "About.travel" });
  const cities = [...profile.cities].sort((a, b) =>
    a.visitedAt.localeCompare(b.visitedAt),
  );

  const points = cities.map((city) => ({
    ...city,
    ...project(city.lat, city.lng),
  }));
  const path = points.length > 1
    ? points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" ")
    : "";

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="space-y-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4" aria-hidden="true" />
          {t("title")}
          {points.length ? (
            <Badge variant="outline" className="ml-1 font-mono text-[0.6rem]">
              {t("count", { count: points.length })}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="relative overflow-hidden rounded-md border border-border/60 bg-background/40">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block h-auto w-full"
            role="img"
            aria-label={t("svgAria", { count: points.length })}
          >
            <defs>
              <pattern
                id="travel-dot-grid"
                x="0"
                y="0"
                width="14"
                height="14"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="0.6" fill="currentColor" opacity="0.18" />
              </pattern>
            </defs>
            <rect
              width={WIDTH}
              height={HEIGHT}
              fill="url(#travel-dot-grid)"
              className="text-muted-foreground"
            />
            {/* Equator + tropics for orientation, very low contrast */}
            {[0, 23.5, -23.5].map((lat) => {
              const { y } = project(lat, 0);
              return (
                <line
                  key={lat}
                  x1={PADDING}
                  x2={WIDTH - PADDING}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={lat === 0 ? 0.18 : 0.1}
                  strokeWidth={0.5}
                  strokeDasharray={lat === 0 ? "0" : "2 4"}
                  className="text-muted-foreground"
                />
              );
            })}
            {path ? (
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.45}
                strokeWidth={0.8}
                strokeDasharray="3 3"
                className="text-ring"
              />
            ) : null}
            {points.map((p) => (
              <g key={`${p.name}-${p.visitedAt}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3.6}
                  className="fill-ring"
                  opacity={0.85}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6.5}
                  className="fill-none stroke-ring"
                  strokeOpacity={0.35}
                  strokeWidth={0.7}
                />
              </g>
            ))}
            {points.length === 0 ? (
              <text
                x={WIDTH / 2}
                y={HEIGHT / 2}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em]"
              >
                {t("empty")}
              </text>
            ) : null}
          </svg>
        </div>
        {points.length > 0 ? (
          <ol className="grid gap-1.5 text-xs">
            {points.map((p) => (
              <li
                key={`${p.name}-${p.visitedAt}`}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="truncate text-foreground">
                  {p.name}
                  <span className="ml-1.5 text-muted-foreground/70">
                    · {p.country}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {p.visitedAt}
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  );
}
