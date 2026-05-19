"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Profile } from "@/content/schemas";

interface TravelMapLeafletProps {
  cities: Profile["cities"];
  ariaLabel: string;
}

// Country names as written in profile.cities → ADMIN field on the
// geo-countries dataset. Identity for our three countries; the map
// stays here so adding more is a one-line change.
const COUNTRY_ALIASES: Record<string, string> = {
  Canada: "Canada",
  China: "China",
  Japan: "Japan",
};

// Module-level cache so re-mounting the about page doesn't refetch the
// ~250 KB country GeoJSON.
let CACHED_GEO: FeatureCollection | null = null;

// CartoDB tile servers — free, attribution-required, no API key.
const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

interface CountryProps {
  ADMIN?: string;
}

export function TravelMapLeaflet({ cities, ariaLabel }: TravelMapLeafletProps) {
  const { resolvedTheme } = useTheme();
  const [geo, setGeo] = useState<FeatureCollection | null>(CACHED_GEO);

  // Resolve the --ring token to an actual color string Leaflet's SVG
  // attribute writer can consume. (Leaflet does not understand CSS
  // variables in style functions.) Computed during render via useMemo
  // so re-renders triggered by theme change pick up the new value
  // without an effect+setState ping-pong.
  const ringColor = useMemo(() => {
    if (typeof window === "undefined") return "#3b82f6";
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--ring")
      .trim();
    if (!raw) return "#3b82f6";
    if (
      raw.startsWith("oklch") ||
      raw.startsWith("#") ||
      raw.startsWith("rgb") ||
      raw.startsWith("hsl")
    ) {
      return raw;
    }
    return `hsl(${raw})`;
    // resolvedTheme intentionally tracked so the memo recomputes when
    // next-themes flips the data-theme attribute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  useEffect(() => {
    if (geo) return;
    let cancelled = false;
    fetch(
      "https://cdn.jsdelivr.net/gh/datasets/geo-countries/data/countries.geojson",
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((json: FeatureCollection | null) => {
        if (cancelled || !json) return;
        CACHED_GEO = json;
        setGeo(json);
      })
      .catch(() => {
        // Silent failure — markers + tiles still render.
      });
    return () => {
      cancelled = true;
    };
  }, [geo]);

  const visited = useMemo(
    () =>
      new Set(
        cities
          .map((c) => COUNTRY_ALIASES[c.country] ?? c.country),
      ),
    [cities],
  );

  // Marker — a token-tinted dot with a soft halo. Uses divIcon so
  // Leaflet doesn't try to load its bundled marker PNGs (which break
  // under bundlers without explicit asset shims).
  const cityIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<span style="display:block;width:10px;height:10px;border-radius:9999px;background:${ringColor};box-shadow:0 0 0 3px color-mix(in srgb, ${ringColor} 25%, transparent);"></span>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      }),
    [ringColor],
  );

  const tileUrl = resolvedTheme === "dark" ? TILE_DARK : TILE_LIGHT;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="relative h-72 w-full overflow-hidden rounded-md border border-border/60 [&_.leaflet-container]:size-full [&_.leaflet-container]:bg-transparent [&_.leaflet-control-attribution]:bg-card/70! [&_.leaflet-control-attribution]:text-[0.5rem]! [&_.leaflet-control-attribution]:text-muted-foreground! [&_.leaflet-control-zoom_a]:border-border! [&_.leaflet-control-zoom_a]:bg-card/80! [&_.leaflet-control-zoom_a]:text-foreground! [&_.leaflet-control-zoom_a]:backdrop-blur!"
    >
      <MapContainer
        center={[35, 90]}
        zoom={2}
        minZoom={1}
        maxZoom={6}
        worldCopyJump
        scrollWheelZoom={false}
        attributionControl
      >
        <TileLayer
          key={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        {geo ? (
          <GeoJSON
            key={`${ringColor}-${visited.size}`}
            data={geo}
            style={(feature?: Feature<Geometry, CountryProps>) => {
              const name = feature?.properties?.ADMIN;
              const isVisited = Boolean(name && visited.has(name));
              return {
                fillColor: ringColor,
                fillOpacity: isVisited ? 0.22 : 0,
                color: ringColor,
                opacity: isVisited ? 0.55 : 0,
                weight: isVisited ? 1 : 0,
              };
            }}
            interactive={false}
          />
        ) : null}
        {cities.map((c) => (
          <Marker
            key={`${c.country}-${c.name}`}
            position={[c.lat, c.lng]}
            icon={cityIcon}
          >
            <Popup>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                {c.country}
              </span>
              <br />
              <strong className="text-sm">{c.name}</strong>
              {c.note ? (
                <>
                  <br />
                  <span className="text-xs">{c.note}</span>
                </>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
