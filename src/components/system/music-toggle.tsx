"use client";

import { useState } from "react";
import { Music2, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ambient-music toggle. Placeholder for the "late phase" audio
 * integration — the icon flips between Music2 (paused) and Pause
 * (playing) and toggles a `data-state` attr so future hooks can
 * wire in the actual <audio> element.
 *
 * For now: state-only, no audio. Tooltip-quiet button that lives in
 * the header's icon cluster next to the sound toggle. The two are
 * distinct: SoundToggle controls UI sounds (palette confirm, hover
 * blips), MusicToggle controls atmospheric background music.
 */
export function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  return (
    <button
      type="button"
      data-state={playing ? "playing" : "paused"}
      aria-label={playing ? "Pause music" : "Play music"}
      aria-pressed={playing}
      onClick={() => setPlaying((v) => !v)}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:-translate-y-px hover:border-ring/50 hover:text-foreground active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        playing && "text-foreground border-ring/60",
      )}
    >
      {playing ? (
        <Pause className="size-4" aria-hidden="true" />
      ) : (
        <Music2 className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
