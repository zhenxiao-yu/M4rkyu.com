import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { SoundToggle } from "@/components/system/sound-toggle";
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
 * existing locale + theme + sound toggles.
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
      <SoundToggle />
      {/* `font-pixel` is safe now that [locale]/layout.tsx propagates
        * `lang={locale}` to the DOM — the `:lang(zh)` guard in
        * globals.css redirects --font-pixel to the display stack on
        * the zh route, so "按" never reaches the VT323 fallback. */}
      <span className="ml-auto font-pixel text-base uppercase tracking-[0.12em] text-muted-foreground">
        {hint}
      </span>
    </nav>
  );
}
