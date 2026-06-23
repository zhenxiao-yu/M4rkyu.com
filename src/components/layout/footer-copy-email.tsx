"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * The footer's contact centerpiece: the email itself, oversized and
 * click-to-copy. Inverts the old small pill — the invitation is the big
 * type, the wordmark below is just the signature. Clipboard is best-effort;
 * the address stays visible (and is also a real mailto in the socials rail),
 * so a blocked clipboard never strands the user.
 */
export function FooterCopyEmail({
  email,
  copyLabel,
  copiedLabel,
}: {
  email: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Insecure context / denied permission — address is still on screen.
    }
  }, [email]);

  return (
    <button
      type="button"
      onClick={onCopy}
      title={copied ? copiedLabel : copyLabel}
      aria-label={`${email} · ${copied ? copiedLabel : copyLabel}`}
      className={cn(
        "group inline-flex max-w-full items-baseline gap-3 rounded-md text-left",
        FOCUS_RING,
      )}
    >
      <span className="relative font-display font-semibold leading-none tracking-tight text-foreground/90 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-foreground text-[clamp(1.4rem,5.2vw,2.75rem)]">
        {email}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-current opacity-60 transition-transform duration-(--motion-medium) ease-(--ease-premium) group-hover:scale-x-100"
        />
      </span>
      <span
        aria-hidden="true"
        className="relative top-0.5 grid size-7 shrink-0 place-items-center rounded-full border text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/50 group-hover:text-ring motion-safe:group-hover:-translate-y-0.5"
      >
        {copied ? (
          <Check className="size-3.5 text-ring" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}
