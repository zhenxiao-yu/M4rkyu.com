import "server-only";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

// Steam stats proxy — server-side because STEAM_API_KEY must never
// ship to the client. ISR-cached 30 min so we sip the per-key rate
// budget. Returns null on any failure or unconfigured env so the card
// renders a graceful empty state instead of breaking the page.
export const revalidate = 1800;

export interface SteamStats {
  persona: string;
  profileUrl: string;
  avatar: string;
  // Steam personastate: 0 offline, 1 online, 2 busy, 3 away,
  // 4 snooze, 5 looking-to-trade, 6 looking-to-play.
  personaState: number;
  // Present only when the user is currently in-game.
  currentGame?: string;
  // Most-recently played game name (last 2 weeks) — used as the
  // headline when not in-game.
  recentGame?: string;
  recentGameHours2w?: number;
  recentGames: Array<{
    name: string;
    hours2w: number;
  }>;
  level?: number;
  totalGames: number;
  totalHours: number;
}

interface PlayerSummary {
  personaname?: string;
  profileurl?: string;
  avatarmedium?: string;
  personastate?: number;
  gameextrainfo?: string;
}

interface OwnedGame {
  playtime_forever?: number;
}

interface RecentGame {
  name?: string;
  playtime_2weeks?: number;
}

export async function GET(): Promise<NextResponse<SteamStats | null>> {
  if (!env.STEAM_API_KEY || !env.STEAM_ID) return NextResponse.json(null);

  const key = env.STEAM_API_KEY;
  const id = env.STEAM_ID;
  const fetchJson = async <T>(url: string): Promise<T | null> => {
    try {
      const r = await fetch(url, { next: { revalidate: 1800 } });
      if (!r.ok) return null;
      return (await r.json()) as T;
    } catch {
      return null;
    }
  };

  const [summaryRes, ownedRes, recentRes, levelRes] = await Promise.all([
    fetchJson<{ response: { players: PlayerSummary[] } }>(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${id}`,
    ),
    fetchJson<{
      response: { game_count?: number; games?: OwnedGame[] };
    }>(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${id}&include_played_free_games=1`,
    ),
    fetchJson<{ response: { games?: RecentGame[] } }>(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${key}&steamid=${id}&count=3`,
    ),
    fetchJson<{ response: { player_level?: number } }>(
      `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${key}&steamid=${id}`,
    ),
  ]);

  const player = summaryRes?.response.players?.[0];
  if (!player) return NextResponse.json(null);

  const ownedGames = ownedRes?.response.games ?? [];
  const totalMinutes = ownedGames.reduce(
    (sum, g) => sum + (g.playtime_forever ?? 0),
    0,
  );
  const recent = recentRes?.response.games?.[0];
  const recentGames =
    recentRes?.response.games
      ?.filter((game): game is Required<Pick<RecentGame, "name" | "playtime_2weeks">> =>
        Boolean(game.name && game.playtime_2weeks),
      )
      .slice(0, 3)
      .map((game) => ({
        name: game.name,
        hours2w: Math.round((game.playtime_2weeks / 60) * 10) / 10,
      })) ?? [];

  return NextResponse.json({
    persona: player.personaname ?? "",
    profileUrl: player.profileurl ?? `https://steamcommunity.com/profiles/${id}`,
    avatar: player.avatarmedium ?? "",
    personaState: player.personastate ?? 0,
    currentGame: player.gameextrainfo,
    recentGame: recent?.name,
    recentGameHours2w: recent?.playtime_2weeks
      ? Math.round((recent.playtime_2weeks / 60) * 10) / 10
      : undefined,
    recentGames,
    level: levelRes?.response.player_level,
    totalGames: ownedRes?.response.game_count ?? ownedGames.length,
    totalHours: Math.round(totalMinutes / 60),
  });
}
