/**
 * Site-wide background music playlist.
 *
 * Three demo tracks are wired in by default — SoundHelix's algorithmic
 * instrumentals, hot-linkable CC and used widely in JS audio examples.
 * Swap in self-hosted files under `public/audio/` and update `src` to a
 * leading-slash path (`"/audio/your-track.mp3"`) when you have final
 * audio. The schema below stays stable.
 */

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  /** Public URL or `/audio/...` path served from `public/`. */
  src: string;
  /** Approx track length in seconds — informational only; the actual
   * duration is read from the audio element once metadata loads. */
  approxSeconds?: number;
}

export const musicTracks: MusicTrack[] = [
  {
    id: "soundhelix-1",
    title: "Algorithmic Drift",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    approxSeconds: 372,
  },
  {
    id: "soundhelix-2",
    title: "Cascade Bay",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    approxSeconds: 425,
  },
  {
    id: "soundhelix-3",
    title: "Halftone Bloom",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    approxSeconds: 348,
  },
];

export type LoopMode = "off" | "track" | "playlist";
