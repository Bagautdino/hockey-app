import { api } from "./client";
import type { GameStat } from "@/types";

interface ApiGameStat {
  id: string;
  player_id: string;
  season: string;
  competition_name?: string | null;
  games_played: number;
  goals?: number | null;
  assists?: number | null;
  points?: number | null;
  plus_minus?: number | null;
  penalty_minutes?: number | null;
  goals_against_avg?: number | null;
  save_pct?: number | null;
  shutouts?: number | null;
  recorded_at: string;
}

function mapGameStat(g: ApiGameStat): GameStat {
  return {
    id: g.id,
    playerId: g.player_id,
    season: g.season,
    competitionName: g.competition_name ?? undefined,
    gamesPlayed: g.games_played,
    goals: g.goals ?? undefined,
    assists: g.assists ?? undefined,
    points: g.points ?? undefined,
    plusMinus: g.plus_minus ?? undefined,
    penaltyMinutes: g.penalty_minutes ?? undefined,
    goalsAgainstAvg: g.goals_against_avg ?? undefined,
    savePct: g.save_pct ?? undefined,
    shutouts: g.shutouts ?? undefined,
    recordedAt: g.recorded_at,
  };
}

export async function fetchGameStats(playerId: string): Promise<GameStat[]> {
  const { data } = await api.get<ApiGameStat[]>(
    `/api/v1/players/${playerId}/game-stats`,
  );
  return data.map(mapGameStat);
}

export async function createGameStat(
  playerId: string,
  body: Record<string, unknown>,
): Promise<GameStat> {
  const { data } = await api.post<ApiGameStat>(
    `/api/v1/players/${playerId}/game-stats`,
    body,
  );
  return mapGameStat(data);
}

export async function updateGameStat(
  statId: string,
  body: Record<string, unknown>,
): Promise<GameStat> {
  const { data } = await api.patch<ApiGameStat>(
    `/api/v1/game-stats/${statId}`,
    body,
  );
  return mapGameStat(data);
}

export async function deleteGameStat(statId: string): Promise<void> {
  await api.delete(`/api/v1/game-stats/${statId}`);
}
