"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, FOCUS_RING } from "@/lib/utils";
import { useCommandPalette } from "./command-palette-provider";

// Platform-correct shortcut label. The provider binds metaKey || ctrlKey, so
// the chip must match the user's OS: ⌘K on Apple, Ctrl K elsewhere. Resolved
// via useSyncExternalStore so the server/first-client render is stable (Apple
// glyph) and it swaps post-hydration with no mismatch warning.
const noopSubscribe = () => () => {};
function isApplePlatform() {
  if (typeof navigator === "undefined") return true;
  const source =
    (navigator as { userAgentData?: { platform?: string } }).userAgentData
      ?.platform ||
    navigator.platform ||
    navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(source);
}
function useShortcutLabel() {
  return useSyncExternalStore(
    noopSubscribe,
    () => (isApplePlatform() ? "⌘K" : "Ctrl K"),
    () => "⌘K",
  );
}

// Header-rail command-palette entry; keydown listener lives in the provider.
export function CommandPaletteTrigger() {
  const { setOpen } = useCommandPalette();
  const t = useTranslations("CommandPalette");
  const shortcut = useShortcutLabel();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex h-9 w-60 items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-xs text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground",
        FOCUS_RING,
      )}
    >
      {/* No aria-label: the visible trigger text IS the accessible name, so
       * it satisfies WCAG 2.5.3 (label in name). The shortcut glyph is
       * decorative and hidden from the name. */}
      <Search aria-hidden="true" className="size-3.5 shrink-0" />
      <span>{t("trigger")}</span>
      <kbd
        aria-hidden="true"
        className="ml-auto shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em]"
      >
        {shortcut}
      </kbd>
    </button>
  );
}
