import { api } from "./client";
import type { AnthroSnapshot } from "@/types";

interface ApiSnapshot {
  id: string;
  player_id: string;
  recorded_at: string;
  height?: number | null;
  weight?: number | null;
  body_fat_pct?: number | null;
}

function mapSnapshot(s: ApiSnapshot): AnthroSnapshot {
  return {
    id: s.id,
    playerId: s.player_id,
    recordedAt: s.recorded_at,
    height: s.height ?? undefined,
    weight: s.weight ?? undefined,
    bodyFatPct: s.body_fat_pct ?? undefined,
  };
}

export async function fetchAnthroSnapshots(
  playerId: string,
  days?: number,
): Promise<AnthroSnapshot[]> {
  const params = days ? `?days=${days}` : "";
  const { data } = await api.get<ApiSnapshot[]>(
    `/api/v1/players/${playerId}/anthro-snapshots${params}`,
  );
  return data.map(mapSnapshot);
}

export async function createAnthroSnapshot(
  playerId: string,
  body: { height?: number; weight?: number; body_fat_pct?: number },
): Promise<AnthroSnapshot> {
  const { data } = await api.post<ApiSnapshot>(
    `/api/v1/players/${playerId}/anthro-snapshots`,
    body,
  );
  return mapSnapshot(data);
}
