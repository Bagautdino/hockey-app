import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AnthroSnapshot } from "@/types";
import {
  fetchAnthroSnapshots,
  createAnthroSnapshot,
} from "@/api/anthroSnapshots";
import snapshotsData from "@/mocks/anthroSnapshots.json";

const mockSnapshots = snapshotsData as AnthroSnapshot[];

const MOCK_PLAYER_IDS = [...new Set(mockSnapshots.map((v) => v.playerId))];

function getMockSnapshotsForPlayer(playerId: string): AnthroSnapshot[] {
  const direct = mockSnapshots.filter((v) => v.playerId === playerId);
  if (direct.length > 0) return direct;

  const hash = [...playerId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mockId = MOCK_PLAYER_IDS[hash % MOCK_PLAYER_IDS.length];
  return mockSnapshots
    .filter((v) => v.playerId === mockId)
    .map((v) => ({ ...v, playerId }));
}

export function useAnthroSnapshots(playerId: string, days = 180) {
  return useQuery({
    queryKey: ["anthroSnapshots", playerId, days],
    queryFn: async () => {
      try {
        const result = await fetchAnthroSnapshots(playerId, days);
        if (result.length > 0) return result;
      } catch {}
      return getMockSnapshotsForPlayer(playerId);
    },
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
