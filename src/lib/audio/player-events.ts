// Lightweight cross-component signal to open the full AudioPlayerDialog.
// The dialog's open state lives locally in <SoundSettingsButton>; the
// now-playing HUD (rendered far away, in the header ribbon) asks for it
// via this window event instead of lifting state into a shared context.
export const AUDIO_PLAYER_OPEN_EVENT = "m4rkyu:audio-player-open";

/** Fire-and-forget request to surface the media-player dialog. No-op on
 * the server. */
export function openAudioPlayer(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUDIO_PLAYER_OPEN_EVENT));
}
