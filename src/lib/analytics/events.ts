import { track } from "@vercel/analytics/react";

// Centralized analytics taxonomy for the audience-growth flywheel. track()
// is a no-op until the Vercel Analytics script mounts, which only happens
// after the visitor grants analytics consent (ConsentAwareAnalytics), so
// these are safe to call unconditionally from client handlers.
//
// Privacy: we never record the raw search query or the Ask prompt — only
// coarse, non-identifying shape (length, result count, channel).

export function trackSearch(query: string, results: number): void {
  track("search", { query_length: query.trim().length, results });
}

export type ShareChannel = "link" | "x" | "linkedin";

export function trackShare(surface: string, channel: ShareChannel): void {
  track("share", { surface, channel });
}

export function trackAsk(): void {
  track("ask_query");
}
