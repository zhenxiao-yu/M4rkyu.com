"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";
import {
  readStoredString,
  writeStoredString,
} from "@/lib/browser/safe-storage";

// First-visit ambient-audio consent. Browser autoplay policy blocks
// sound before a user gesture, so we never force playback silently:
//   - unset preference → a one-time toast; "Enable" (the consenting
//     click, a valid gesture) starts playback and persists "on".
//   - "on" → arm one-shot gesture listeners so audio starts on the
//     visitor's first interaction (the policy-compliant "autoplay").
//   - "off" → do nothing.
const PREF_KEY = "m4rkyu.audio.autoplay";
const GESTURES = ["pointerdown", "keydown", "touchstart"] as const;

export function AudioAutoplayConsent() {
  const t = useTranslations("AudioPlayer");
  const { play, tracks } = useAudioPlayer();
  const ranRef = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode's double-invoke in dev.
    if (ranRef.current) return;
    ranRef.current = true;
    if (tracks.length === 0) return;

    const pref = readStoredString(PREF_KEY);
    if (pref === "off") return;

    if (pref === "on") {
      // Start on the first interaction anywhere — calling play() inside
      // a real gesture sidesteps the autoplay block (and the player's
      // own blocked-playback error path).
      const handler = () => {
        cleanup();
        play();
      };
      const cleanup = () => {
        for (const evt of GESTURES) window.removeEventListener(evt, handler);
      };
      for (const evt of GESTURES) {
        window.addEventListener(evt, handler, { passive: true });
      }
      return cleanup;
    }

    // Unset → prompt once, shortly after the page settles.
    const timer = window.setTimeout(() => {
      toast(t("autoplayTitle"), {
        // Stable id → never duplicates (e.g. on locale change / remount);
        // it just joins the shared stack like any other toast.
        id: "audio-autoplay-consent",
        description: t("autoplayBody"),
        duration: 12000,
        action: {
          label: t("autoplayEnable"),
          onClick: () => {
            writeStoredString(PREF_KEY, "on");
            play();
          },
        },
        cancel: {
          label: t("autoplayDismiss"),
          onClick: () => writeStoredString(PREF_KEY, "off"),
        },
      });
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [play, t, tracks.length]);

  return null;
}
