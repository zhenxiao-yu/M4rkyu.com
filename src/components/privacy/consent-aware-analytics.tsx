"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { readConsent, subscribeConsent } from "@/lib/privacy/consent";

export function ConsentAwareAnalytics() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    readConsent,
    () => null,
  );

  if (!consent?.analytics) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
