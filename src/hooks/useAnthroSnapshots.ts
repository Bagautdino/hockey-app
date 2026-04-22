import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAnthroSnapshots,
  createAnthroSnapshot,
} from "@/api/anthroSnapshots";

export function useAnthroSnapshots(playerId: string, days = 180) {
  return useQuery({
    queryKey: ["anthroSnapshots", playerId, days],
    queryFn: () => fetchAnthroSnapshots(playerId, days),
    enabled: !!playerId,
    staleTime: 30_000,
  });
}

export function useCreateAnthroSnapshot(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      height?: number;
      weight?: number;
      body_fat_pct?: number;
    }) => createAnthroSnapshot(playerId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["anthroSnapshots", playerId] });
      qc.invalidateQueries({ queryKey: ["players", playerId] });
    },
  });
}
