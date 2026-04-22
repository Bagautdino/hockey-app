import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchGameStats,
  createGameStat,
  updateGameStat,
  deleteGameStat,
} from "@/api/gameStats";

export function useGameStats(playerId: string) {
  return useQuery({
    queryKey: ["gameStats", playerId],
    queryFn: () => fetchGameStats(playerId),
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
