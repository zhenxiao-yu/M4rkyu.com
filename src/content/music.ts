export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  /** Public `/audio/...` path served from `public/`. */
  src: string;
  mood?: "calm" | "dark" | "playful" | "ambient" | "focus";
  pageFit?: Array<"home" | "work" | "archive" | "games" | "logs">;
  approxSeconds?: number;
  loopSafe?: boolean;
  enabled?: boolean;
  sourceNote?: string;
}

export const musicManifest: MusicTrack[] = [
  {
    id: "signal-garden-01",
    title: "Signal Garden 01",
    artist: "M4rkyu",
    src: "/audio/music/signal-garden-01.mp3",
    mood: "ambient",
    pageFit: ["home", "work"],
    approxSeconds: 72,
    loopSafe: true,
    enabled: false,
    sourceNote: "Planned self-hosted site loop.",
  },
  {
    id: "archive-lantern-01",
    title: "Archive Lantern 01",
    artist: "M4rkyu",
    src: "/audio/music/archive-lantern-01.mp3",
    mood: "calm",
    pageFit: ["archive", "logs"],
    approxSeconds: 64,
    loopSafe: true,
    enabled: false,
    sourceNote: "Planned self-hosted site loop.",
  },
  {
    id: "pixel-room-01",
    title: "Pixel Room 01",
    artist: "M4rkyu",
    src: "/audio/music/pixel-room-01.mp3",
    mood: "playful",
    pageFit: ["games"],
    approxSeconds: 58,
    loopSafe: true,
    enabled: false,
    sourceNote: "Planned self-hosted site loop.",
  },
];

export const musicTracks = musicManifest.filter(
  (track) => track.enabled === true,
);

export const demoMusicTracks: MusicTrack[] = [
  {
    id: "soundhelix-1",
    title: "Algorithmic Drift",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    mood: "focus",
    approxSeconds: 372,
    loopSafe: false,
    enabled: false,
    sourceNote: "Remote demo fallback only; do not use for production audio.",
  },
];

export type LoopMode = "off" | "track" | "playlist";
