"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { CollectionFlowMenu } from "./collection-flow-menu";
import { CollectionPlate } from "./collection-plate";
import type { GalleryCollection } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Collections explorer — wraps the archive index in a two-view switch:
 *
 *   • "editorial" (default) — the big-type {@link CollectionFlowMenu} wall,
 *     the signature browsing experience.
 *   • "grid" — a dense, Google-Photos-style grid of {@link CollectionPlate}
 *     catalogue cards for people who'd rather scan covers than read rows.
 *
 * The switch is a liquid-glass segmented control whose active indicator glides
 * between tabs (shared `layoutId`). The choice persists in localStorage, but
 * the SSR markup always renders the editorial wall first, so first-time and
 * no-JS visitors get the canonical view with zero flash.
 */

type View = "editorial" | "grid";
const STORAGE_KEY = "gallery:collections-view";

interface CollectionsExplorerProps {
  collections: GalleryCollection[];
  /** Real ready-frame count per collection slug. */
  counts: Record<string, number>;
  /** Map-search query per collection slug; present → row shows a map link. */
  placeQueries: Record<string, string>;
  locale: Locale;
}

export function CollectionsExplorer({
  collections,
  counts,
  placeQueries,
  locale,
}: CollectionsExplorerProps) {
  const t = useTranslations("Gallery");
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>("editorial");

  // Restore the reader's last choice after hydration — never on the server, so
  // the editorial wall is always the canonical SSR view (no layout flash for
  // first-time / no-JS visitors).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      // Post-hydration sync from a previous visit. Reading this in the initial
      // useState would desync SSR ("editorial") from a "grid"-preferring client
      // and trip a hydration mismatch, so the effect update is deliberate.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "grid" || saved === "editorial") setView(saved);
    } catch {
      /* storage blocked (private mode) — keep the default */
    }
  }, []);

  function choose(next: View) {
    setView(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* non-fatal */
    }
  }

  const views = [
    { id: "editorial" as const, label: t("viewEditorial"), Icon: Rows3 },
    { id: "grid" as const, label: t("viewGrid"), Icon: LayoutGrid },
  ];

  return (
    <div>
      {/* Liquid-glass view switch — the active indicator glides between tabs. */}
      <div className="mb-6 flex items-center justify-end sm:mb-8">
        <div
          role="tablist"
          aria-label={t("viewToggleLabel")}
          className="glass-surface inline-flex items-center gap-0.5 rounded-full p-1"
        >
          {views.map(({ id, label, Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => choose(id)}
                className={cn(
                  "relative inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] transition-colors duration-(--motion-fast) ease-(--ease-premium) sm:min-h-9 sm:px-3",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  FOCUS_RING,
                )}
              >
                {active ? (
                  reduce ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full bg-background shadow-sm shadow-black/5"
                    />
                  ) : (
                    <motion.span
                      aria-hidden="true"
                      layoutId="collections-view-pill"
                      className="pointer-events-none absolute inset-0 rounded-full bg-background shadow-sm shadow-black/5"
                      transition={{
                        type: "spring",
                        stiffness: 460,
                        damping: 40,
                        mass: 0.8,
                      }}
                    />
                  )
                ) : null}
                <Icon aria-hidden="true" className="relative z-10 size-3.5" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {view === "editorial" ? (
        <CollectionFlowMenu
          collections={collections}
          counts={counts}
          placeQueries={placeQueries}
          locale={locale}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {collections.map((collection, i) => (
            <CollectionPlate
              key={collection.slug}
              collection={collection}
              index={i + 1}
              countLabel={t("framesCount", {
                count: counts[collection.slug] ?? 0,
              })}
              enterLabel={t("enter")}
              featuredLabel={t("featured")}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
