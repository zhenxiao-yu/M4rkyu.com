import type { Metadata } from "next";
import type { ReactNode } from "react";

// Saved frames are visitor-local state, not crawlable content.
// `robots.ts` already disallows the path, but this `noindex` blocks
// any inbound link from indexing the route on link signal alone.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SavedLayout({ children }: { children: ReactNode }) {
  return children;
}
