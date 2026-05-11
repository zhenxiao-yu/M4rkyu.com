"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSoundEnabled } from "@/hooks/use-sound-enabled";
import { playCue, setSoundEnabled } from "@/lib/audio/ui-sound";

/**
 * Single source of truth for "is UI sound on?" — Phase 7
 * (docs/UNIFIED_VISUAL_DIRECTION.md §4.10). Lives in the hero's
 * GameHud; future PR can move it into the global page layout.
 *
 * Behavior:
 * - Default OFF (the localStorage key starts unset).
 * - Switching ON fires one `confirm` tone so the user hears what
 *   they just enabled. Switching OFF stays silent.
 * - `prefers-reduced-motion` does NOT disable the toggle UI (the
 *   user can still toggle it), but `playCue` itself short-circuits
 *   under reduced motion.
 */
export function SoundToggle() {
  const enabled = useSoundEnabled();
  const label = enabled ? "Mute UI sound" : "Enable UI sound";

  function toggle() {
    const next = !enabled;
    setSoundEnabled(next);
    if (next) {
      // Order matters: persist first, then play. The `playCue` call
      // re-reads `isSoundEnabled()` so the new value must be stored
      // before the confirm tone fires.
      playCue("confirm");
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-pressed={enabled}
          aria-label={label}
          data-testid="sound-toggle"
          onClick={toggle}
          className="h-9 w-9 border-border bg-background/70 p-0 text-muted-foreground hover:border-ring/50 hover:bg-background/70 hover:text-foreground"
        >
          {enabled ? (
            <Volume2 className="size-4" aria-hidden="true" />
          ) : (
            <VolumeX className="size-4" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
