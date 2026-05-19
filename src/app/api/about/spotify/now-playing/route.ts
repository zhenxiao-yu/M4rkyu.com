import "server-only";

import { NextResponse } from "next/server";
import { env } from "@/lib/env";

// Spotify now-playing proxy. Degrades to {isPlaying:false} when the
// refresh-token env vars aren't set, so the card can render a "Not
// playing" empty state in local dev or unconfigured deploys.
//
// Authorize once via scripts/spotify-authorize.ts to mint the refresh
// token, then set SPOTIFY_CLIENT_ID / SECRET / REFRESH_TOKEN in env.
// Force-dynamic because the response is per-request real-time data —
// no useful CDN cache window here.
export const dynamic = "force-dynamic";

export interface NowPlaying {
  isPlaying: boolean;
  track?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  url?: string;
}

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

async function getAccessToken(): Promise<string | null> {
  if (
    !env.SPOTIFY_CLIENT_ID ||
    !env.SPOTIFY_CLIENT_SECRET ||
    !env.SPOTIFY_REFRESH_TOKEN
  ) {
    return null;
  }

  const basic = Buffer.from(
    `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const json = (await response.json()) as { access_token?: string };
  return json.access_token ?? null;
}

interface SpotifyTrack {
  name?: string;
  external_urls?: { spotify?: string };
  artists?: { name?: string }[];
  album?: {
    name?: string;
    images?: { url?: string }[];
  };
}

function formatTrack(item: SpotifyTrack | undefined, isPlaying: boolean): NowPlaying {
  if (!item) return { isPlaying: false };
  return {
    isPlaying,
    track: item.name,
    artist: item.artists?.map((a) => a.name).filter(Boolean).join(", "),
    album: item.album?.name,
    albumArt: item.album?.images?.[0]?.url,
    url: item.external_urls?.spotify,
  };
}

export async function GET(): Promise<NextResponse<NowPlaying>> {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ isPlaying: false });

  try {
    const playing = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (playing.status === 200) {
      const json = (await playing.json()) as {
        is_playing?: boolean;
        item?: SpotifyTrack;
      };
      if (json.item) {
        return NextResponse.json(formatTrack(json.item, json.is_playing ?? false));
      }
    }

    // 204 → nothing playing right now; fall back to most recent track.
    const recent = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!recent.ok) return NextResponse.json({ isPlaying: false });
    const recentJson = (await recent.json()) as {
      items?: { track?: SpotifyTrack }[];
    };
    const lastTrack = recentJson.items?.[0]?.track;
    return NextResponse.json(formatTrack(lastTrack, false));
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}
