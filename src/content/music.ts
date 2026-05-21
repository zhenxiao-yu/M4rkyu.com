export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  /** Public `/audio/...` path served from `public/`. */
  src: string;
  mood?: "calm" | "dark" | "playful" | "ambient" | "focus";
  approxSeconds?: number;
  loopSafe?: boolean;
  enabled?: boolean;
  sourceNote?: string;
}

// Site-wide background playlist. One global queue; changing the track in
// the player swaps the whole-site background music. Files live in
// `public/audio/music/` and stream via `preload="metadata"`, so only the
// playing track downloads its body — adding more tracks costs ~nothing
// until played. Set `enabled: false` to keep a track in the manifest but
// out of the public player.
export const musicManifest: MusicTrack[] = [
  {
    id: "five-minute-timer-lofi",
    title: "5-Minute Timer (Lofi)",
    artist: "Lo-Fi",
    src: "/audio/music/five-minute-timer-lofi.mp3",
    mood: "focus",
    loopSafe: true,
    enabled: true,
    sourceNote: "Artist not in source filename — verify/adjust.",
  },
  {
    id: "baby-blue",
    title: "Baby Blue",
    artist: "Badfinger",
    src: "/audio/music/baby-blue.mp3",
    mood: "calm",
    enabled: true,
    sourceNote: "Artist inferred from title — verify.",
  },
  {
    id: "blade-runner-love-theme",
    title: "Blade Runner — Love Theme",
    artist: "Vangelis",
    src: "/audio/music/blade-runner-love-theme.mp3",
    mood: "ambient",
    enabled: true,
  },
  {
    id: "mr-tambourine-man",
    title: "Mr. Tambourine Man",
    artist: "Bob Dylan",
    src: "/audio/music/mr-tambourine-man.mp3",
    mood: "calm",
    enabled: true,
  },
  {
    id: "mr-jones",
    title: "Mr. Jones",
    artist: "Counting Crows",
    src: "/audio/music/mr-jones.mp3",
    mood: "playful",
    enabled: true,
  },
  {
    id: "i-am-the-antichrist-to-you",
    title: "I Am the Antichrist to You",
    artist: "Kishi Bashi",
    src: "/audio/music/i-am-the-antichrist-to-you.mp3",
    mood: "calm",
    enabled: true,
  },
  {
    id: "full-circle",
    title: "Full Circle",
    artist: "Movements",
    src: "/audio/music/full-circle.mp3",
    mood: "dark",
    enabled: true,
  },
  {
    id: "i-fought-the-law",
    title: "I Fought the Law",
    artist: "The Clash",
    src: "/audio/music/i-fought-the-law.mp3",
    mood: "playful",
    enabled: true,
  },
  {
    id: "ask",
    title: "Ask",
    artist: "The Smiths",
    src: "/audio/music/ask.mp3",
    mood: "playful",
    enabled: true,
  },
  {
    id: "theme-from-taxi-driver",
    title: "Theme from Taxi Driver",
    artist: "Bernard Herrmann",
    src: "/audio/music/theme-from-taxi-driver.mp3",
    mood: "dark",
    enabled: true,
    sourceNote: "Composer inferred from title — verify.",
  },
  {
    id: "tian-mi-mi",
    title: "甜蜜蜜 (Tian Mi Mi)",
    artist: "Teresa Teng",
    src: "/audio/music/tian-mi-mi.mp3",
    mood: "calm",
    enabled: true,
  },
  {
    id: "we-are-charlie-kirk-nightcore",
    title: "We Are Charlie Kirk (Nightcore)",
    artist: "Nightcore",
    src: "/audio/music/we-are-charlie-kirk-nightcore.mp3",
    mood: "playful",
    enabled: true,
    sourceNote: "Artist not in source filename — verify/adjust.",
  },
  {
    id: "haunt-me",
    title: "Haunt Me",
    artist: "Teen Suicide",
    src: "/audio/music/haunt-me.mp3",
    mood: "dark",
    enabled: true,
    sourceNote: "Artist inferred from title — verify.",
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
