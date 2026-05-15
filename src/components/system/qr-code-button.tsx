"use client";

import { useState } from "react";
import { QrCode, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface QrCodeButtonProps {
  /** Site URL displayed in the popover. */
  url?: string;
}

/**
 * QR-code icon button. Click toggles a small popover showing the
 * site URL + a placeholder QR slot. The actual QR rendering is left
 * as a future swap-in (e.g. drop a <QRCodeSVG value={url}/> from
 * `qrcode.react` once that dep is added — the slot's dimensions
 * already match the standard ~140×140 QR canvas).
 */
export function QrCodeButton({ url = "https://m4rkyu.com" }: QrCodeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Show site QR code"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
          "hover:-translate-y-px hover:border-ring/50 hover:text-foreground active:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open && "text-foreground border-ring/60",
        )}
      >
        <QrCode className="size-4" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Site QR code"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-xl border border-border/70 bg-background/95 p-4 shadow-xl shadow-black/10 backdrop-blur-xl dark:shadow-black/30"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                scan · share
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close QR code"
                className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* QR slot — placeholder grid until a real renderer is wired.
              * Dimensions match the standard 140px QR canvas so swapping
              * in `<QRCodeSVG value={url} size={140} />` is a one-liner. */}
            <div
              aria-hidden="true"
              className="mt-3 grid h-[140px] place-items-center rounded-md border border-dashed border-border bg-card/40 text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, color-mix(in srgb, var(--foreground) 10%, transparent) 25%, transparent 25%), linear-gradient(-45deg, color-mix(in srgb, var(--foreground) 10%, transparent) 25%, transparent 25%)",
                backgroundSize: "8px 8px",
              }}
            >
              <span className="rounded-sm bg-background/85 px-2 py-1">qr · pending</span>
            </div>

            <p className="mt-3 break-all font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground/80">
              {url.replace(/^https?:\/\//, "")}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
