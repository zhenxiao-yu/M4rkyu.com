"use client";

import { useSyncExternalStore } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@vercel/analytics/react";
import { readConsent, subscribeConsent } from "@/lib/privacy/consent";

/**
 * Forwards Core Web Vitals to Vercel Analytics as custom events, gated on the
 * same analytics-consent signal `ConsentAwareAnalytics` reads. When consent is
 * absent the hook still runs (hooks can't be conditional) but the callback
 * short-circuits, so nothing is sent. Renders nothing.
 */
export function WebVitalsReporter() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    readConsent,
    () => null,
  );
  const analyticsAllowed = Boolean(consent?.analytics);

  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[web-vitals]", metric.name, metric.value, metric.rating);
    }

    if (!analyticsAllowed) return;

    track("web-vitals", {
      metric: metric.name,
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value,
      ),
      rating: metric.rating ?? null,
      id: metric.id,
    });
  });

  return null;
}
