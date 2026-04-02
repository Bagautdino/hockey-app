import { api } from "./client";
import type { Player } from "@/types";

interface PlayerFilters {
  region?: string;
  position?: string;
  age_min?: number;
  age_max?: number;
}

interface ApiAnthro {
  height: number;
  weight: number;
  arm_span: number;
  leg_length: number;
  torso_length: number;
  sitting_height: number;
  shoulder_width: number;
  shoe_size: number;
  body_fat_pct?: number | null;
}

interface ApiPlayer {
  id: string;
  owner_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  birth_date: string;
  position: string;
  shooting_hand: string;
  city: string;
  region: string;
  team?: string | null;
  jersey_number?: number | null;
  rating: number;
  avatar?: string | null;
  anthropometrics?: ApiAnthro | null;
}

function mapApiPlayer(p: ApiPlayer): Player {
  const anthro = p.anthropometrics;
  return {
    id: p.id,
    firstName: p.first_name,
    lastName: p.last_name,
    middleName: p.middle_name ?? undefined,
    birthDate: p.birth_date,
    position: p.position as Player["position"],
    shootingHand: p.shooting_hand as Player["shootingHand"],
    region: p.region,
    city: p.city,
    team: p.team ?? undefined,
    jerseyNumber: p.jersey_number ?? undefined,
    rating: p.rating,
    avatar: p.avatar ?? "",
    parentId: p.owner_id,
    anthropometrics: anthro
      ? {
          height: anthro.height,
          weight: anthro.weight,
          armSpan: anthro.arm_span,
          legLength: anthro.leg_length,
          torsoLength: anthro.torso_length,
          sittingHeight: anthro.sitting_height,
          shoulderWidth: anthro.shoulder_width,
          shoeSize: anthro.shoe_size,
          bodyFatPct: anthro.body_fat_pct ?? undefined,
        }
      : {
          height: 0,
          weight: 0,
          armSpan: 0,
          legLength: 0,
          torsoLength: 0,
          sittingHeight: 0,
          shoulderWidth: 0,
          shoeSize: 0,
        },
  };
}

export async function fetchPlayers(filters?: PlayerFilters): Promise<Player[]> {
  const params = new URLSearchParams();
  if (filters?.region) params.set("region", filters.region);
  if (filters?.position) params.set("position", filters.position);
  if (filters?.age_min != null) params.set("age_min", String(filters.age_min));
  if (filters?.age_max != null) params.set("age_max", String(filters.age_max));
  const { data } = await api.get<ApiPlayer[]>(`/api/v1/players?${params}`);
  return data.map(mapApiPlayer);
}

export async function fetchPlayer(id: string): Promise<Player | null> {
  try {
    const { data } = await api.get<ApiPlayer>(`/api/v1/players/${id}`);
    return mapApiPlayer(data);
  } catch {
    return null;
  }
}

export interface CreatePlayerBody {
  first_name: string;
  last_name: string;
  middle_name?: string;
  birth_date: string;
  position: string;
  shooting_hand: string;
  city: string;
  region: string;
  team?: string;
  jersey_number?: number;
  anthropometrics: {
    height: number;
    weight: number;
    arm_span: number;
    leg_length: number;
    torso_length: number;
    sitting_height: number;
    shoulder_width: number;
    shoe_size: number;
    body_fat_pct?: number;
  };
}

export async function createPlayer(body: CreatePlayerBody): Promise<Player> {
  const { data } = await api.post<ApiPlayer>("/api/v1/players", body);
  return mapApiPlayer(data);
}

export async function fetchPlayerRating(playerId: string): Promise<{
  rating: number;
  regional_rank: number;
  regional_total: number;
}> {
  const { data } = await api.get(`/api/v1/players/${playerId}/rating`);
  return data;
}

interface ApiTestSession {
  id: string;
  player_id: string;
  recorded_at: string;
  sprint_20m_fwd?: number | null;
  sprint_20m_bwd?: number | null;
  sprint_60m?: number | null;
  standing_jump?: number | null;
  long_jump?: number | null;
  agility?: number | null;
  flexibility?: number | null;
  push_ups?: number | null;
  pull_ups?: number | null;
  plank_sec?: number | null;
  balance_test_sec?: number | null;
}

export async function fetchTestSessions(playerId: string): Promise<ApiTestSession[]> {
  const { data } = await api.get<ApiTestSession[]>(`/api/v1/players/${playerId}/tests`);
  return data;
}
