import * as React from "react";
import { Button, type ButtonProps } from "../button";
import { cn } from "@/lib/utils";

type Glyph = "caret" | "play" | "send";
type Sound = "click" | "confirm";

const GLYPHS: Record<Glyph, string> = {
  caret: ">",
  play: "▶",
  send: "↵",
};

export interface PixelButtonProps extends ButtonProps {
  /** Optional leading VT323 glyph that slides in on hover. */
  glyph?: Glyph;
  /**
   * UI sound cue to emit on press. Prop is accepted in Phase 2 but
   * not yet wired — Phase 7 adds the Web Audio module + SoundToggle.
   * See docs/UNIFIED_VISUAL_DIRECTION.md §8.
   */
  sound?: Sound;
}

export const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  // `sound` is accepted in Phase 2 but unused — destructured here so
  // it never reaches `...rest` and lands on <button> as a stray DOM
  // attribute. Phase 7 (Web Audio module + SoundToggle) will swap the
  // unused destructure for an `useUiSound(sound)` hook fired on click.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Phase 7 stub
  ({ glyph, sound, className, children, ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        // `transition` covers transform AND colors (both in v4's default
        // property set), so the press scale + the inherited hover-color
        // animation share one timing function. `active:scale-[0.98]` is
        // the "confirm" press from §7.2.
        className={cn(
          "group transition duration-(--motion-micro) ease-(--ease-premium) active:scale-[0.98]",
          className,
        )}
        {...rest}
      >
        {glyph ? (
          <span
            aria-hidden="true"
            className="font-pixel text-base leading-none opacity-60 transition duration-(--motion-fast) ease-(--ease-premium) group-hover:translate-x-0.5 group-hover:opacity-100"
          >
            {GLYPHS[glyph]}
          </span>
        ) : null}
        {children}
      </Button>
    );
  },
);
PixelButton.displayName = "PixelButton";
