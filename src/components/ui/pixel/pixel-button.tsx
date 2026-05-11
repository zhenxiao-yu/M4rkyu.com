"use client";

import * as React from "react";
import { Button, type ButtonProps } from "../button";
import { Link } from "@/i18n/navigation";
import { playCue } from "@/lib/audio/ui-sound";
import { cn } from "@/lib/utils";

type Glyph = "caret" | "play" | "send";
type Sound = "click" | "confirm";

const GLYPHS: Record<Glyph, string> = {
  caret: ">",
  play: "▶",
  send: "↵",
};

const GLYPH_CLASS =
  "font-pixel text-base leading-none opacity-60 transition duration-(--motion-fast) ease-(--ease-premium) group-hover:translate-x-0.5 group-hover:opacity-100";

const BASE_CLASS =
  "group transition duration-(--motion-micro) ease-(--ease-premium) active:scale-[0.98]";

export interface PixelButtonProps extends Omit<ButtonProps, "asChild"> {
  /** Optional leading VT323 glyph that slides in on hover. */
  glyph?: Glyph;
  /**
   * UI sound cue fired on click. Phase 7 wires this to the Web Audio
   * module in `src/lib/audio/ui-sound.ts`; `playCue` itself is a no-op
   * unless SoundToggle is ON and `prefers-reduced-motion` is unset.
   */
  sound?: Sound;
  /**
   * When set, PixelButton renders an internal next-intl `<Link>` to this
   * href (button mode otherwise). Use this in place of the prior
   * `asChild + <Link>` pattern; nesting the glyph + label inside the
   * Link in one client tree avoids the `React.Children.only` failure
   * the asChild path hit across the RSC server→client boundary.
   * When provided, `onClick` is ignored.
   */
  href?: string;
}

function renderGlyph(glyph: Glyph | undefined) {
  if (!glyph) return null;
  return (
    <span aria-hidden="true" className={GLYPH_CLASS}>
      {GLYPHS[glyph]}
    </span>
  );
}

export const PixelButton = React.forwardRef<
  HTMLButtonElement,
  PixelButtonProps
>(function PixelButton(
  { glyph, sound, href, className, children, onClick, ...rest },
  ref,
) {
  if (href) {
    // Dev-only warning — the prop type allows `onClick + href` together
    // but only the audio cue fires in link mode (Link handles its own
    // navigation). Surface that quietly rather than letting a caller's
    // handler silently never run.
    if (process.env.NODE_ENV !== "production" && onClick) {
      console.warn(
        "PixelButton: `onClick` is ignored when `href` is set. Move the handler into the link target or drop `href`.",
      );
    }
    return (
      <Button
        ref={ref}
        asChild
        className={cn(BASE_CLASS, className)}
        onClick={() => {
          if (sound) playCue(sound);
        }}
        {...rest}
      >
        <Link href={href}>
          {renderGlyph(glyph)}
          {children}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      ref={ref}
      className={cn(BASE_CLASS, className)}
      onClick={(event) => {
        if (sound) playCue(sound);
        onClick?.(event);
      }}
      {...rest}
    >
      {renderGlyph(glyph)}
      {children}
    </Button>
  );
});
