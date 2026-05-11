"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Bell, BellRing } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Minimal post shape the bell needs — keeps the prop surface narrow. */
export interface NotificationPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  canonicalUrl?: string;
}

interface NotificationBellProps {
  posts: NotificationPost[];
  locale: Locale;
}

const STORAGE_KEY = "m4rkyu.notifications.lastSeen";

/**
 * useSyncExternalStore-driven read of the lastSeen timestamp from
 * localStorage. The store emits via a `storage` event on writes (in
 * other tabs) and via a window-scoped CustomEvent for same-tab
 * writes (which `storage` doesn't fire for).
 */
const STORAGE_EVENT = "m4rkyu:notifications:lastSeen";

function subscribeLastSeen(callback: () => void): () => void {
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) callback();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function readLastSeen(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

/** Server snapshot: treat everything as already-seen so SSR + first
 * client paint don't flash a badge for returning visitors. The real
 * value lands on the next render after hydration. */
function serverSnapshot(): number {
  return Number.POSITIVE_INFINITY;
}

/** Sort posts newest first by parsed date; unparseable dates sink. */
function sortNewestFirst(posts: NotificationPost[]): NotificationPost[] {
  return [...posts].sort((a, b) => {
    const ta = Date.parse(a.date);
    const tb = Date.parse(b.date);
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return tb - ta;
  });
}

export function NotificationBell({ posts, locale }: NotificationBellProps) {
  const t = useTranslations("Notifications");
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const lastSeen = useSyncExternalStore(
    subscribeLastSeen,
    readLastSeen,
    serverSnapshot,
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ordered = useMemo(() => sortNewestFirst(posts).slice(0, 6), [posts]);

  const unreadCount = useMemo(() => {
    // On the SSR pass / before hydration, serverSnapshot returns
    // Infinity so this loop yields 0 — the badge stays hidden until
    // the client has the real lastSeen value, avoiding a flash.
    return ordered.reduce((count, post) => {
      const stamp = Date.parse(post.date);
      if (!Number.isFinite(stamp)) return count;
      return stamp > lastSeen ? count + 1 : count;
    }, 0);
  }, [ordered, lastSeen]);

  const markAllRead = useCallback(() => {
    const now = Date.now();
    try {
      window.localStorage.setItem(STORAGE_KEY, String(now));
      // Same-tab writes don't fire `storage`; broadcast manually so
      // the subscriber recomputes.
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
    } catch {
      /* localStorage may be unavailable (private mode) — silent fallback. */
    }
  }, []);

  const ariaStatus = t("unreadStatus", { count: unreadCount });

  // Motion presets — single source of truth so reduced-motion can
  // collapse them to instant transitions in one place.
  const panelInitial = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -8, scale: 0.96 };
  const panelAnimate = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };
  const panelTransition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.18, ease: [0.2, 0.7, 0.2, 1] as const };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={t("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex size-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open && "border-ring/60 text-foreground",
        )}
      >
        {unreadCount > 0 ? (
          <BellRing aria-hidden="true" className="size-4" />
        ) : (
          <Bell aria-hidden="true" className="size-4" />
        )}
        <AnimatePresence>
          {unreadCount > 0 ? (
            <motion.span
              key="badge"
              aria-hidden="true"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] as const }}
              className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-background bg-ring px-1 font-mono text-[0.55rem] font-semibold tabular-nums leading-none text-background"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          ) : null}
        </AnimatePresence>
        <span className="sr-only">{ariaStatus}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label={t("heading")}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelInitial}
            transition={panelTransition}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-xl border border-border/80 bg-background/95 shadow-xl shadow-black/10 backdrop-blur-xl"
          >
          <header className="flex items-baseline justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{t("heading")}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {t("subheading")}
              </p>
            </div>
            {ordered.length > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="shrink-0 rounded-sm font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("markRead")}
              </button>
            ) : null}
          </header>

          {ordered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {ordered.map((post) => {
                const stamp = Date.parse(post.date);
                const isNew = Number.isFinite(stamp) && stamp > lastSeen;
                return (
                  <li key={post.slug}>
                    <Link
                      href={`/logs/${post.slug}`}
                      locale={locale}
                      onClick={() => {
                        markAllRead();
                        setOpen(false);
                      }}
                      className="group flex items-start gap-3 px-4 py-3 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:outline-none"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-1.5 inline-block size-1.5 shrink-0 rounded-full",
                          isNew ? "bg-ring" : "bg-border",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                            {post.category}
                          </span>
                          {isNew ? (
                            <span className="rounded-sm border border-ring/40 bg-ring/10 px-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ring">
                              {t("newBadge")}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block truncate text-sm font-medium text-foreground group-hover:text-foreground">
                          {post.title}
                        </span>
                        <span className="mt-1 block font-mono text-[0.65rem] text-muted-foreground">
                          {post.date}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <footer className="border-t border-border/60 px-4 py-3">
            <Link
              href="/logs"
              locale={locale}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="truncate">{t("viewAll")}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </footer>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
