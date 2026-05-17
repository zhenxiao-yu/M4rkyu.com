"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Copy, QrCode, Share2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { shareOrCopy } from "@/lib/social/share";
import { cn } from "@/lib/utils";

interface QrCodeButtonProps {
  /** Canonical site URL — the address the static QR asset encodes. */
  url?: string;
  /** Public asset path for the scannable QR image. */
  assetSrc?: string;
}

/**
 * Share-this-site affordance in the header chrome. The QR asset is
 * static (pre-rendered, no client QR-gen dependency) and encodes the
 * site root; the popover wraps it with Copy + native Share actions so
 * the button is useful from a desktop too — not just a poster you scan
 * with your phone.
 */
export function QrCodeButton({
  url = "https://m4rkyu.com",
  assetSrc = "/qr-code.svg",
}: QrCodeButtonProps) {
  const t = useTranslations("Social");
  const [open, setOpen] = useState(false);
  const canNativeShare = useSyncExternalStore(
    subscribeNoop,
    getCanShareSnapshot,
    getServerSnapshot,
  );
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Move focus into the dialog on open so Escape works and screen
  // readers announce the new context.
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
  }, [open]);

  // Dismiss on Escape + outside click while open.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  async function copyToClipboard() {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      toast.error(t("sharingUnavailable"));
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("linkCopied"));
    } catch {
      toast.error(t("sharingUnavailable"));
    }
  }

  async function nativeShare() {
    const result = await shareOrCopy({ title: host, text: host, url });
    if (result === "shared") toast.success(t("shared"));
    else if (result === "copied") toast.success(t("linkCopied"));
    else toast.error(t("sharingUnavailable"));
  }

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={t("shareSiteAria")}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
              "hover:-translate-y-px hover:border-ring/50 hover:text-foreground active:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              open && "border-ring/60 text-foreground",
            )}
          >
            <QrCode className="size-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{t("shareSiteAria")}</TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {open ? (
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t("shareSiteAria")}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
              className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-xl border border-border/70 bg-background/95 p-4 shadow-xl shadow-black/10 backdrop-blur-xl dark:shadow-black/30"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {t("scanShareEyebrow")}
                </p>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("closeShareAria")}
                  className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 flex justify-center">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("openSiteAria")}
                  className="group relative inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Image
                    src={assetSrc}
                    alt=""
                    width={160}
                    height={160}
                    className="size-[160px] rounded-md border border-border bg-white p-2 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-px"
                    loading="lazy"
                  />
                </a>
              </div>

              <p className="mt-3 text-center font-mono text-[0.7rem] tracking-tight text-foreground">
                {host}
              </p>

              <button
                type="button"
                onClick={copyToClipboard}
                aria-label={t("copyLink")}
                title={url}
                className="mt-3 inline-flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-left font-mono text-[0.62rem] uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="truncate">{url.replace(/\/$/, "")}</span>
                <Copy className="size-3.5 shrink-0" aria-hidden="true" />
              </button>

              <div
                className={cn(
                  "mt-2 grid gap-2",
                  canNativeShare ? "grid-cols-2" : "grid-cols-1",
                )}
              >
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                  {t("copyLink")}
                </button>
                {canNativeShare ? (
                  <button
                    type="button"
                    onClick={nativeShare}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-ring/60 bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Share2 className="size-3.5" aria-hidden="true" />
                    {t("share")}
                  </button>
                ) : null}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// One-time client-only feature detection. Subscribe is a no-op because
// `navigator.share` doesn't change after page load; the SSR snapshot is
// `false` so the dialog renders the single-button (copy-only) layout
// before hydration matches.
function subscribeNoop(): () => void {
  return () => {};
}
function getCanShareSnapshot(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
function getServerSnapshot(): boolean {
  return false;
}
