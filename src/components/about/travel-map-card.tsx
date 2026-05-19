import { MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { TravelMapMount } from "./travel-map-mount";

// Server-rendered shell — translates strings and renders the bento
// card chrome. The interactive map (react-leaflet) is loaded client-
// only via `TravelMapMount` to keep Leaflet's `window` access out of
// the server bundle.
export async function TravelMapCard({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "About.travel" });
  const cities = profile.cities;

  // Country summary chip rail — keeps the dense city list out of the
  // card while showing the visited countries at a glance.
  const counts = cities.reduce<Map<string, number>>((map, c) => {
    map.set(c.country, (map.get(c.country) ?? 0) + 1);
    return map;
  }, new Map());

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="space-y-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4" aria-hidden="true" />
          {t("title")}
          {cities.length ? (
            <Badge variant="outline" className="ml-1 font-mono text-[0.6rem]">
              {t("count", { count: cities.length })}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {cities.length > 0 ? (
          <>
            <TravelMapMount
              cities={cities}
              ariaLabel={t("svgAria", { count: cities.length })}
            />
            <div className="flex flex-wrap gap-1.5">
              {Array.from(counts.entries()).map(([country, n]) => (
                <Badge
                  key={country}
                  variant="outline"
                  className="font-mono text-[0.6rem]"
                >
                  {country} · {n}
                </Badge>
              ))}
            </div>
          </>
        ) : (
          <div className="grid h-72 place-items-center rounded-md border border-dashed border-border/60 bg-background/40">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t("empty")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
