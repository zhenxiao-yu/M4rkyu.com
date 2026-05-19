"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// Thin client wrapper. Lives here so the parent travel-map-card can
// stay a server component while the actual Leaflet renderer (which
// touches `window` at import time) is loaded only on the client.
const TravelMapLeaflet = dynamic(
  () =>
    import("./travel-map-leaflet").then((m) => ({
      default: m.TravelMapLeaflet,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full animate-pulse rounded-md border border-border/60 bg-muted/30" />
    ),
  },
);

type Props = ComponentProps<typeof TravelMapLeaflet>;

export function TravelMapMount(props: Props) {
  return <TravelMapLeaflet {...props} />;
}
