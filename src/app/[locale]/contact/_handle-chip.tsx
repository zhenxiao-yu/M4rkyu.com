"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Gamepad2, MessageSquare } from "lucide-react";
import { cn, FOCUS_RING } from "@/lib/utils";

// Icon lives here, not as a prop — a Server Component can't pass a
// component type across the client boundary (it isn't serializable),
// so the caller selects by string variant instead.
const VARIANT_ICONS = {
  wechat: MessageSquare,
  discord: Gamepad2,
} as const;

/**
 * Click-to-copy handle chip. Used for channels that have no public web
 * profile (WeChat, Discord), where a dead link would be wrong — the
 * natural affordance is to copy the ID. Matches the contact page's
 * SocialChip shape so it sits flush in the channels grid.
 */
export function CopyHandleChip({
  variant,
  label,
  value,
  copyHint,
  copiedHint,
}: {
  variant: keyof typeof VARIANT_ICONS;
  label: string;
  value: string;
  copyHint: string;
  copiedHint: string;
}) {
  const Icon = VARIANT_ICONS[variant];
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context / permissions) — the ID is
      // still visible in the chip, so the user can select it manually.
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`${label} · ${value} · ${copied ? copiedHint : copyHint}`}
      title={copied ? copiedHint : copyHint}
      className={cn(
        "inline-flex w-full items-center gap-2 rounded-full border px-3.5 py-2 text-sm text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">
        {label}
        <span className="ml-1.5 font-mono text-xs text-muted-foreground/70">
          {value}
        </span>
      </span>
      {copied ? (
        <Check className="ml-auto size-3.5 shrink-0 text-ring" aria-hidden="true" />
      ) : (
        <Copy
          className="ml-auto size-3.5 shrink-0 text-muted-foreground/60"
          aria-hidden="true"
        />
      )}
      {/* Polite live region so SR users hear the copy succeed — the
          button's own aria-label change isn't reliably announced. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedHint : ""}
      </span>
    </button>
  );
}
