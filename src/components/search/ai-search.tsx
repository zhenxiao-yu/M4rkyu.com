"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CornerDownLeft, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  href: string;
  external: boolean;
  subtitle?: string;
  reason: string;
}

type Status = "idle" | "loading" | "results" | "empty" | "error";
type ErrorKind = "rateLimited" | "unavailable" | "generic";

export function AiSearch() {
  const t = useTranslations("Search");
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [errorKind, setErrorKind] = useState<ErrorKind>("generic");
  const abortRef = useRef<AbortController | null>(null);
  const listId = useId();

  const examples = t.raw("examples") as string[];

  const runSearch = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (q.length < 2) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("loading");
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
          signal: controller.signal,
        });
        if (!res.ok) {
          setErrorKind(
            res.status === 429
              ? "rateLimited"
              : res.status === 503
                ? "unavailable"
                : "generic",
          );
          setStatus("error");
          return;
        }
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setStatus(data.results.length > 0 ? "results" : "empty");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setErrorKind("generic");
        setStatus("error");
      }
    },
    [],
  );

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      // Reset on close so the next open starts clean.
      abortRef.current?.abort();
      setQuery("");
      setStatus("idle");
      setResults([]);
    }
  }, []);

  return (
    <>
      {/* Floating launcher. Bottom-left to avoid the bottom-right HUD/audio
       * controls; nudge if your layout collides. Hidden from print. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("trigger")}
        className={cn(
          "glass-surface fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full",
          "border border-border/60 px-3.5 py-2.5 text-sm font-medium shadow-lg",
          "text-foreground/80 transition-colors hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "print:hidden",
        )}
      >
        <Sparkles className="size-4 text-ring" aria-hidden="true" />
        <span className="hidden sm:inline">{t("trigger")}</span>
      </button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl gap-0 p-0 sm:max-w-xl">
          <div className="border-b border-border/60 p-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-ring" aria-hidden="true" />
              {t("title")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs">
              {t("description")}
            </DialogDescription>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void runSearch(query);
              }}
              className="mt-3 flex items-center gap-2"
              role="search"
            >
              <div className="relative flex-1">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  maxLength={200}
                  enterKeyHint="search"
                  placeholder={t("placeholder")}
                  aria-label={t("placeholder")}
                  aria-controls={listId}
                  className={cn(
                    "w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm",
                    "placeholder:text-muted-foreground focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                />
                <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex">
                  <CornerDownLeft className="size-3" aria-hidden="true" />
                </kbd>
              </div>
            </form>
          </div>

          <div
            id={listId}
            aria-live="polite"
            className="max-h-[55vh] min-h-[8rem] overflow-y-auto p-2"
          >
            {status === "idle" && (
              <div className="px-2 py-3">
                <p className="px-1 text-xs text-muted-foreground">
                  {t("idleHint")}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {examples.map((ex) => (
                    <li key={ex}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(ex);
                          void runSearch(ex);
                        }}
                        className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-foreground/70 transition-colors hover:border-ring/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {ex}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {status === "loading" && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("loading")}
              </div>
            )}

            {status === "empty" && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium">{t("emptyTitle")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("emptyBody")}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium">{t("errorTitle")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    errorKind === "rateLimited"
                      ? "errorRateLimited"
                      : errorKind === "unavailable"
                        ? "errorUnavailable"
                        : "errorGeneric",
                  )}
                </p>
              </div>
            )}

            {status === "results" && (
              <ul className="space-y-1">
                <AnimatePresence initial={!reduceMotion}>
                  {results.map((r, i) => (
                    <motion.li
                      key={r.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: reduceMotion ? 0 : i * 0.03 }}
                    >
                      <ResultCard result={r} typeLabel={t(`types.${r.type}`)} onNavigate={() => onOpenChange(false)} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
            <span>{t("poweredBy")}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResultCard({
  result,
  typeLabel,
  onNavigate,
}: {
  result: SearchResult;
  typeLabel: string;
  onNavigate: () => void;
}) {
  const inner = (
    <div className="flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/60">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{result.title}</span>
          {result.external && (
            <ArrowUpRight className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {result.reason}
        </p>
      </div>
      <Badge variant="outline" className="shrink-0 text-[10px]">
        {typeLabel}
      </Badge>
    </div>
  );

  if (result.external) {
    return (
      <a
        href={result.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={result.href}
      onClick={onNavigate}
      className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {inner}
    </Link>
  );
}
