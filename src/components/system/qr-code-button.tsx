"use client";

import { useState } from "react";
import { QrCode, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface QrCodeButtonProps {
  /** Site URL displayed in the popover. */
  url?: string;
  /** Public asset path for the scannable QR image. */
  assetSrc?: string;
}

/**
 * QR-code icon button. Click toggles a compact popover with a real,
 * static QR asset so the header share affordance is useful without
 * adding a QR-generation dependency to the client bundle.
 */
export function QrCodeButton({
  url = "https://m4rkyu.com",
  assetSrc = "/qr-code.svg",
}: QrCodeButtonProps) {
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

            <Image
              src={assetSrc}
              alt=""
              width={140}
              height={140}
              className="mt-3 size-[140px] rounded-md border border-border bg-white p-2"
              loading="lazy"
            />

            <p className="mt-3 break-all font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground/80">
              {url.replace(/^https?:\/\//, "")}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
