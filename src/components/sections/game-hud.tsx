import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { cn } from "@/lib/utils";

interface GameHudProps {
  /**
   * Translated Cmd-K reminder text. Displayed at the right edge of the
   * HUD strip; consumer-owned so /en and /zh can supply different copy.
   * The actual Cmd-K trigger lives in the page header — this is a
   * passive reminder, not an interactive button.
   */
  hint: string;
  className?: string;
}

/**
 * Persistent "system status" strip rendered in the homepage hero
 * footer (and, in a future phase, every page layout). Composes the
 * existing locale + theme toggles; the sound toggle slot is wired
 * in Phase 7.
 */
export function GameHud({ hint, className }: GameHudProps) {
  return (
    <nav
      aria-label="System status"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border/60 pt-4",
        className,
      )}
    >
      <LanguageSwitcher />
      <ThemeSwitcher />
      {/* Phase 7 slot — SoundToggle will land here without disturbing layout. */}
      {/* `font-mono` (not `font-pixel`) because the zh hint contains the CJK
        * character "按"; the `:lang(zh)` guard in globals.css doesn't yet
        * fire (root layout still hardcodes `lang="en"`), so font-pixel
        * would render that glyph through the per-glyph VT323 fallback. */}
      <span className="ml-auto font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {hint}
      </span>
    </nav>
  );
}
