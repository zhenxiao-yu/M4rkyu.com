# Audio System

M4rkyu.com treats audio as an optional layer. Nothing autoplays: the first real
music start must come from a user pressing play, and UI sound effects only play
after the sound toggle is enabled.

## Architecture

- Background music streams through native HTML audio elements in
  `src/lib/audio/audio-player-context.tsx`.
- The provider is mounted in `src/app/[locale]/layout.tsx`, so music state
  survives route changes.
- UI sound effects are generated instantly with Web Audio in
  `src/lib/audio/ui-sound.ts`.
- The playlist manifest lives in `src/content/music.ts`.

Music streams. SFX synthesize or preload as tiny buffers. Do not decode full
music tracks into Web Audio memory.

## Music Files

Put final music here:

```text
public/audio/music/
  signal-garden-01.mp3
  archive-lantern-01.mp3
  pixel-room-01.mp3
```

Reference them with leading-slash public paths:

```ts
{
  id: "signal-garden-02",
  title: "Signal Garden 02",
  artist: "M4rkyu",
  src: "/audio/music/signal-garden-02.mp3",
  mood: "ambient",
  pageFit: ["home", "work"],
  approxSeconds: 74,
  loopSafe: true,
  enabled: true,
}
```

Set `enabled: false` for planned tracks whose files are not ready yet. Disabled
tracks stay in the manifest for planning, but they are filtered out of the
public player and never prewarmed or played.

Recommended formats:

- MP3 for maximum browser safety.
- AAC/M4A is fine when you have a tested fallback strategy.
- Keep site loops around 30-90 seconds where possible.
- Aim for 128-192 kbps and under 2 MB per short loop when possible.
- Use compressed, web-ready files rather than source-quality masters.

## Loading Strategy

The active music element uses `preload="metadata"`, so the browser fetches
duration and basic metadata without downloading the whole playlist.

When music is playing, a separate hidden preloader points at the likely next
track and loads metadata only. With shuffle enabled, the provider predicts one
random next track. This keeps next-track starts quicker without preloading 20+
full songs.

Track changes while playing use two HTML audio elements for a soft crossfade.
The default fade is about one second. If a browser cannot complete playback or a
file is missing, the player moves into a quiet error state instead of leaving the
UI stuck as playing.

In development, failed tracks print a warning with the track id and `src`. In
production, the console stays quiet. If playback was active, the provider skips
to the next enabled track that has not already failed in this playback attempt.
If all enabled tracks fail, playback stops without retrying forever.

To test missing-file behavior:

1. Temporarily set one manifest item to `enabled: true`.
2. Point its `src` at a missing file under `/audio/music/`.
3. Run the dev server and press play.
4. Confirm the dialog shows the unavailable state and the dev console warning.

## UI SFX

`src/lib/audio/ui-sound.ts` currently supports:

```text
hover-soft
click
open
close
confirm
save
unsave
unlock
error-soft
scene-enter
```

Add a new procedural cue by extending `SoundCue` and the `CUES` map. Keep cues
short, quiet, and comfortably pitched. Frequent or rare-but-special cues should
have a cooldown in `CUE_COOLDOWNS_MS`.

Current wired moments:

- Sound toggle enable confirmation: `confirm`.
- Audio settings panel open/close: `open` / `close`.
- Audio settings SFX test button: `confirm`, and only when sound is enabled.
- Shared save button success: `save` / `unsave`.
- Shared save button failure: `error-soft`.
- `PixelButton` can play a cue only when a caller explicitly passes `sound`.

Future semantic hooks already exist in `src/lib/audio/ui-sound.ts`:

- `playBadgeUnlockCue()` for badge unlocks or hidden discoveries.
- `playContactSentCue()` for successful contact/email sends.
- `playNotificationCue({ highValue })` for important notifications.
- `playAdminSuccessCue()` for admin or moderation success.

When to use sound:

| Interaction | Cue |
| --- | --- |
| Important opted-in CTA press | `click` |
| Special large hero/portal element hover only | `hover-soft` |
| Open dialog, drawer, or player | `open` |
| Close dialog or drawer | `close` |
| Save/bookmark item | `save` |
| Remove saved item | `unsave` |
| Successful form/account action | `confirm` |
| Badge or hidden item unlocked | `unlock` |
| Failed or invalid action | `error-soft` |
| Special page/section entry | `scene-enter` |

When not to use sound:

- Normal text links.
- Every button by default.
- Normal nav links.
- Every hover.
- Scroll events or mouse movement.
- Reading, typing, or form focus.
- Dense lists.
- Gallery browsing or repeated card grids.
- Mobile hover/focus equivalents.
- Notifications that can arrive frequently.

Hover sounds are opt-in only for special large hero/portal elements. Never use
`hover-soft` inside dense lists, normal navigation, text links, galleries, or
repeated cards.

Tasteful rules:

- Sound is opt-in.
- SFX volume starts low and stays separate from BGM volume.
- Most UI cues should stay under 180 ms.
- Nothing should exceed 600 ms except background music.
- Avoid harsh high frequencies, casino/arcade cues, mobile notification sounds,
  and meme effects.
- Use `unlock` and `scene-enter` rarely.
- Silence is part of the design.

If file-based SFX are added later, put tiny files in `public/audio/sfx/`, decode
them after the first user interaction, cache the `AudioBuffer`s, and keep the
procedural cue as fallback.

## Preferences

The provider persists:

- BGM volume
- SFX volume
- loop mode
- shuffle mode
- current track index

Playback state itself is not persisted because browser autoplay policy would
block resume on reload.

## Performance Notes

- Do not preload the full music catalog.
- Do not decode full music tracks into memory.
- Use Web Audio buffers only for tiny SFX.
- Keep sound default off and respect `prefers-reduced-motion` for surprise UI
  feedback.
- Avoid global animation loops for audio UI; use native media events.
