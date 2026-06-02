"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { SearchDoc } from "@/lib/search/catalog";
import { searchDocs } from "@/lib/search/rank";
import { trackSearch } from "@/lib/analytics/events";
import { cn, FOCUS_RING } from "@/lib/utils";

const eyebrowMono =
  "font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground";

function ResultRow({ doc, typeLabel }: { doc: SearchDoc; typeLabel: string }) {
  const className = cn(
    "group flex flex-col gap-1 rounded-lg border border-border bg-background/60 p-4 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
    FOCUS_RING,
  );
  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={eyebrowMono}>{typeLabel}</span>
        {doc.subtitle ? (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
            {doc.subtitle}
          </span>
        ) : null}
      </div>
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        {doc.title}
        {doc.external ? (
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
        ) : null}
      </span>
      <span className="line-clamp-2 text-sm text-muted-foreground">
        {doc.description}
      </span>
    </>
  );
  return doc.external ? (
    <a
      href={doc.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {inner}
    </a>
  ) : (
    <Link href={doc.href} className={className}>
      {inner}
    </Link>
  );
}

export function SearchClient({ catalog }: { catalog: SearchDoc[] }) {
  const t = useTranslations("Search");
  const typeLabels = useTranslations("Topics.types");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  // Keep the URL in sync (debounced) so a search is shareable and
  // back/forward restores it, without a navigation per keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = query.trim()
        ? `${pathname}?q=${encodeURIComponent(query.trim())}`
        : pathname;
      router.replace(next, { scroll: false });
    }, 250);
    return () => window.clearTimeout(id);
  }, [query, pathname, router]);

  const results = useMemo(
    () => searchDocs(catalog, query),
    [catalog, query],
  );
  const trimmed = query.trim();

  // Coarse search analytics — length + result count only, never the text.
  // Debounced longer than the URL sync so we log settled queries, not noise.
  useEffect(() => {
    if (!trimmed) return;
    const id = window.setTimeout(
      () => trackSearch(trimmed, results.length),
      600,
    );
    return () => window.clearTimeout(id);
  }, [trimmed, results.length]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className={cn(
            "h-12 w-full rounded-lg border border-border bg-background/70 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
            FOCUS_RING,
          )}
        />
      </div>

      <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
        {trimmed
          ? t("resultsCount", { count: results.length })
          : t("typePrompt")}
      </p>

      {trimmed && results.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="mt-4 grid list-none grid-cols-1 gap-3 p-0">
          {results.map((doc) => (
            <li key={doc.id}>
              <ResultRow doc={doc} typeLabel={typeLabels(doc.type)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
