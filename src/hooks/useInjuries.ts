import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInjuries,
  createInjury,
  updateInjury,
  deleteInjury,
} from "@/api/injuries";

export function useInjuries(playerId: string) {
  return useQuery({
    queryKey: ["injuries", playerId],
    queryFn: () => fetchInjuries(playerId),
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
