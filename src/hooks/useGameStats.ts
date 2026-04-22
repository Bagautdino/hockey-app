import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GameStat } from "@/types";
import {
  fetchGameStats,
  createGameStat,
  updateGameStat,
  deleteGameStat,
} from "@/api/gameStats";
import gameStatsData from "@/mocks/gameStats.json";

const mockGameStats = gameStatsData as GameStat[];

const MOCK_PLAYER_IDS = [...new Set(mockGameStats.map((v) => v.playerId))];

function getMockGameStatsForPlayer(playerId: string): GameStat[] {
  const direct = mockGameStats.filter((v) => v.playerId === playerId);
  if (direct.length > 0) return direct;

  const hash = [...playerId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mockId = MOCK_PLAYER_IDS[hash % MOCK_PLAYER_IDS.length];
  return mockGameStats
    .filter((v) => v.playerId === mockId)
    .map((v) => ({ ...v, playerId }));
}

export function useGameStats(playerId: string) {
  return useQuery({
    queryKey: ["gameStats", playerId],
    queryFn: async () => {
      try {
        const result = await fetchGameStats(playerId);
        if (result.length > 0) return result;
      } catch {}
      return getMockGameStatsForPlayer(playerId);
    },
    enabled: !!playerId,
    staleTime: 30_000,
  });
}

export function useCreateGameStat(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      createGameStat(playerId, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["gameStats", playerId] }),
  });
}

export function useUpdateGameStat(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      statId,
      body,
    }: {
      statId: string;
      body: Record<string, unknown>;
    }) => updateGameStat(statId, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["gameStats", playerId] }),
  });
}

export function useDeleteGameStat(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (statId: string) => deleteGameStat(statId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["gameStats", playerId] }),
  });
}
