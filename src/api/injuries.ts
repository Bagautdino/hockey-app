import { api } from "./client";
import type { Injury } from "@/types";

interface ApiInjury {
  id: string;
  player_id: string;
  name: string;
  description?: string | null;
  injury_date: string;
  recovery_days?: number | null;
  status: string;
  notes?: string | null;
  created_at: string;
}

function mapInjury(i: ApiInjury): Injury {
  return {
    id: i.id,
    playerId: i.player_id,
    name: i.name,
    description: i.description ?? undefined,
    injuryDate: i.injury_date,
    recoveryDays: i.recovery_days ?? undefined,
    status: i.status as Injury["status"],
    notes: i.notes ?? undefined,
    createdAt: i.created_at,
  };
}

export async function fetchInjuries(playerId: string): Promise<Injury[]> {
  const { data } = await api.get<ApiInjury[]>(
    `/api/v1/players/${playerId}/injuries`,
  );
  return data.map(mapInjury);
}

export async function createInjury(
  playerId: string,
  body: {
    name: string;
    description?: string;
    injury_date: string;
    recovery_days?: number;
    status?: string;
    notes?: string;
  },
): Promise<Injury> {
  const { data } = await api.post<ApiInjury>(
    `/api/v1/players/${playerId}/injuries`,
    body,
  );
  return mapInjury(data);
}

export async function updateInjury(
  injuryId: string,
  body: {
    name?: string;
    description?: string;
    recovery_days?: number;
    status?: string;
    notes?: string;
  },
): Promise<Injury> {
  const { data } = await api.patch<ApiInjury>(
    `/api/v1/injuries/${injuryId}`,
    body,
  );
  return mapInjury(data);
}

export async function deleteInjury(injuryId: string): Promise<void> {
  await api.delete(`/api/v1/injuries/${injuryId}`);
}
