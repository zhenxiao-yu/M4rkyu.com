"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellRing, MonitorCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type {
  NotificationStateResponse,
} from "@/app/api/notifications/state/route";
import type { SiteNotification } from "@/lib/notifications/feed";
import { useLastSeen } from "@/lib/hooks/use-last-seen";
import { playNotificationCue } from "@/lib/audio/ui-sound";
import { cn, FOCUS_RING } from "@/lib/utils";

interface NotificationBellProps {
  items: SiteNotification[];
  locale: Locale;
}

const LAST_SEEN_KEY = "m4rkyu.notifications.lastSeen";

// Module-level guard shared across both header bell instances (the desktop
// and mobile rails each mount one). Keyed by the newest notification's
// timestamp so a genuine alert toasts exactly once — never doubled by the
// two mounts, never replayed across re-renders.
let lastNotifiedStamp = 0;

export function NotificationBell({ items, locale }: NotificationBellProps) {
  const t = useTranslations("Notifications");
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  // Guest "last seen" lives in localStorage behind a useSyncExternalStore
  // hook. It's SSR-safe: the server snapshot is +Infinity, so nothing
  // reads as unread on the server or the first client render, and the
  // badge can't cause a hydration mismatch (Bell vs BellRing). The real
  // value lands on the post-hydration render. Signed-in users layer the
  // server timestamp on top via `state.lastSeenAt`.
  const { lastSeen: storedLastSeen, markSeen } = useLastSeen(LAST_SEEN_KEY);
  const [state, setState] = useState<NotificationStateResponse>(() => ({
    signedIn: false,
    lastSeenAt: null,
    browserNotifications: false,
    emailNotifications: false,
  }));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previousUnreadRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications/state")
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as NotificationStateResponse;
      })
      .then((data) => {
        if (!cancelled) {
          setState((current) => ({
            ...data,
            lastSeenAt: data.lastSeenAt ?? current.lastSeenAt,
          }));
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

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

  const ordered = useMemo(() => sortNewestFirst(items).slice(0, 12), [items]);
  // Newest of the local (guest) and server (signed-in) timestamps. On the
  // server `storedLastSeen` is +Infinity → unreadCount is 0 → no badge.
  const serverLastSeen = state.lastSeenAt ? Date.parse(state.lastSeenAt) : 0;
  const lastSeen = Math.max(serverLastSeen, storedLastSeen);
  const unreadCount = useMemo(() => {
    return ordered.reduce((count, item) => {
      const stamp = Date.parse(item.occurredAt);
      if (!Number.isFinite(stamp)) return count;
      return stamp > lastSeen ? count + 1 : count;
    }, 0);
  }, [ordered, lastSeen]);

  // `storedLastSeen` is +Infinity until localStorage hydrates, so the
  // unread count transitions 0 → N on the first post-hydration render.
  // Gate the alert on a finite value so the baseline is seeded from the
  // REAL count — otherwise every page load spuriously toasts "new
  // notifications" (and, with a bell in each header rail, does it twice).
  const lastSeenReady = Number.isFinite(storedLastSeen);
  useEffect(() => {
    if (!lastSeenReady) return;
    if (previousUnreadRef.current === null) {
      previousUnreadRef.current = unreadCount;
      return;
    }
    if (unreadCount > previousUnreadRef.current) {
      const newestStamp = ordered.length ? Date.parse(ordered[0]!.occurredAt) : 0;
      // Cross-instance + cross-render dedupe: only the first bell to see a
      // newer item fires, and only once per item.
      if (Number.isFinite(newestStamp) && newestStamp > lastNotifiedStamp) {
        lastNotifiedStamp = newestStamp;
        playNotificationCue({ highValue: unreadCount > 1 });
        toast(t("toastTitle"), {
          id: "m4rkyu-notification",
          description: t("toastDescription", { count: unreadCount }),
        });
        maybeShowBrowserNotification(
          t("toastTitle"),
          t("toastDescription", { count: unreadCount }),
          state,
        );
      }
    }
    previousUnreadRef.current = unreadCount;
  }, [lastSeenReady, ordered, state, t, unreadCount]);

  const markAllRead = useCallback(() => {
    // Writes Date.now() to localStorage and broadcasts to this + other
    // tabs; the useSyncExternalStore hook re-renders us with the new
    // timestamp, so unreadCount drops immediately.
    markSeen();
    if (state.signedIn) {
      void patchNotificationState({ lastSeenAt: new Date().toISOString() }).then(
        (next) => {
          if (next) setState((current) => ({ ...current, ...next }));
        },
      );
    }
  }, [markSeen, state.signedIn]);

  const enableBrowserNotifications = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    setState((current) => ({ ...current, browserNotifications: enabled }));
    if (state.signedIn) {
      void patchNotificationState({ browserNotifications: enabled }).then((next) => {
        if (next) setState((current) => ({ ...current, ...next }));
      });
    }
  }, [state.signedIn]);

  const ariaStatus = t("unreadStatus", { count: unreadCount });
  const panelInitial = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -8, scale: 0.96 };
  const panelAnimate = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };
  const panelTransition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.18, ease: [0.2, 0.7, 0.2, 1] as const };
  const canEnableBrowser =
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission !== "granted";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={t("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex size-9 pointer-coarse:size-11 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground hover:-translate-y-px active:translate-y-0",
          FOCUS_RING,
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
            // Below lg the bell lives mid-rail (theme / sound / menu sit to
            // its right), so an `absolute right-0` panel anchored to the bell
            // overflows off the left edge. Pin it to the viewport as a sheet
            // under the header instead; restore the anchored dropdown at lg+
            // where the bell ends the desktop rail.
            className="fixed inset-x-3 top-16 z-50 mx-auto max-w-sm origin-top overflow-hidden rounded-xl border border-border/80 bg-background/95 shadow-xl shadow-black/10 backdrop-blur-xl sm:top-24 lg:absolute lg:inset-x-auto lg:right-0 lg:top-[calc(100%+0.5rem)] lg:mx-0 lg:w-96 lg:max-w-none lg:origin-top-right"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
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
                  className={cn(
                    "shrink-0 rounded-sm font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
                    FOCUS_RING,
                  )}
                >
                  {t("markRead")}
                </button>
              ) : null}
            </header>

            {canEnableBrowser ? (
              <button
                type="button"
                onClick={enableBrowserNotifications}
                className={cn(
                  "flex w-full items-center gap-2 border-b border-border/60 px-4 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
                  FOCUS_RING,
                )}
              >
                <MonitorCheck className="size-4" aria-hidden="true" />
                <span>{t("enableBrowser")}</span>
              </button>
            ) : null}

            {ordered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t("empty")}
              </div>
            ) : (
              <ul
                data-lenis-prevent
                className="max-h-96 overflow-y-auto overscroll-contain touch-pan-y py-1"
              >
                {ordered.map((item) => {
                  const stamp = Date.parse(item.occurredAt);
                  const isNew = Number.isFinite(stamp) && stamp > lastSeen;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
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
                              {item.label}
                            </span>
                            {isNew ? (
                              <span className="rounded-sm border border-ring/40 bg-ring/10 px-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ring">
                                {t("newBadge")}
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 block truncate text-sm font-medium text-foreground group-hover:text-foreground">
                            {item.title}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {item.body}
                          </span>
                          <span className="mt-1 block font-mono text-[0.65rem] text-muted-foreground">
                            {formatDate(item.occurredAt, locale)}
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
                className={cn(
                  "inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground",
                  FOCUS_RING,
                )}
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

function sortNewestFirst(items: SiteNotification[]): SiteNotification[] {
  return [...items].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

async function patchNotificationState(body: {
  lastSeenAt?: string;
  browserNotifications?: boolean;
  emailNotifications?: boolean;
}) {
  try {
    const response = await fetch("/api/notifications/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    return (await response.json()) as NotificationStateResponse;
  } catch {
    return null;
  }
}

function maybeShowBrowserNotification(
  title: string,
  body: string,
  state: NotificationStateResponse,
) {
  if (!state.browserNotifications) return;
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag: "m4rkyu-notifications" });
  } catch {
    // Browser notification support is best-effort.
  }
}

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
