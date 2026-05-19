"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn, FOCUS_RING } from "@/lib/utils";

interface FooterCopyEmailProps {
  email: string;
  copyLabel: string;
  copiedLabel: string;
}

// Click-to-copy email chip. Falls back to a mailto: navigation if the
// clipboard API is unavailable (older Safari / no permission). The
// copied state self-clears after 2s so the visual confirmation reads
// like a polite confirmation, not a permanent state change.
export function FooterCopyEmail({
  email,
  copyLabel,
  copiedLabel,
}: FooterCopyEmailProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? copiedLabel : copyLabel}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md py-1 font-mono text-sm tracking-tight text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring sm:text-base",
        FOCUS_RING,
      )}
    >
      <span className="relative inline-block">
        {email}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current opacity-70 transition-transform duration-(--motion-medium) ease-(--ease-premium) group-hover:scale-x-100",
            copied && "scale-x-100",
          )}
        />
      </span>
      <span
        className={cn(
          "grid size-7 place-items-center rounded-md border bg-background/55 text-muted-foreground transition-[border-color,color,background-color] duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/60 group-hover:text-ring",
          copied && "border-ring/60 text-ring",
        )}
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </span>
      <span className="sr-only">{copied ? copiedLabel : copyLabel}</span>
    </button>
  );
}
