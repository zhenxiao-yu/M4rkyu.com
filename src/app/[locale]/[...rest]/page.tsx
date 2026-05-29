import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

// Localized catch-all. Any unmatched path under /[locale]/… matches here
// and calls notFound(), so it renders the branded [locale]/not-found.tsx
// (with full layout + locale context) instead of Next's bare default 404.
// Real routes always win over this catch-all, so it only fires on typos /
// dead links. Setting the request locale first keeps the not-found page's
// getLocale() / translations correct.
export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: Locale; rest: string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
