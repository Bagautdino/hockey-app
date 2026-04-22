import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Injury } from "@/types";
import {
  fetchInjuries,
  createInjury,
  updateInjury,
  deleteInjury,
} from "@/api/injuries";
import injuriesData from "@/mocks/injuries.json";

const mockInjuries = injuriesData as Injury[];

const MOCK_PLAYER_IDS = [...new Set(mockInjuries.map((v) => v.playerId))];

function getMockInjuriesForPlayer(playerId: string): Injury[] {
  const direct = mockInjuries.filter((v) => v.playerId === playerId);
  if (direct.length > 0) return direct;

  const hash = [...playerId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mockId = MOCK_PLAYER_IDS[hash % MOCK_PLAYER_IDS.length];
  return mockInjuries
    .filter((v) => v.playerId === mockId)
    .map((v) => ({ ...v, playerId }));
}

export function useInjuries(playerId: string) {
  return useQuery({
    queryKey: ["injuries", playerId],
    queryFn: async () => {
      try {
        const result = await fetchInjuries(playerId);
        if (result.length > 0) return result;
      } catch {}
      return getMockInjuriesForPlayer(playerId);
    },
    enabled: !!playerId,
    staleTime: 30_000,
  });
}

export function useCreateInjury(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createInjury>[1]) =>
      createInjury(playerId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["injuries", playerId] }),
  });
}

export function useUpdateInjury(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      injuryId,
      body,
    }: {
      injuryId: string;
      body: Parameters<typeof updateInjury>[1];
    }) => updateInjury(injuryId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["injuries", playerId] }),
  });
}

export function useDeleteInjury(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (injuryId: string) => deleteInjury(injuryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["injuries", playerId] }),
  });
}
