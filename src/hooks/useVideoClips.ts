import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchVideoClips,
  createVideoClip,
  deleteVideoClip,
} from "@/api/videoClips";

export function useVideoClips(playerId: string, category?: string) {
  return useQuery({
    queryKey: ["videoClips", playerId, category],
    queryFn: () => fetchVideoClips(playerId, category),
    enabled: !!playerId,
    staleTime: 30_000,
  });
}

export function useCreateVideoClip(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createVideoClip>[1]) =>
      createVideoClip(playerId, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["videoClips", playerId] }),
  });
}

export function useDeleteVideoClip(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clipId: string) => deleteVideoClip(clipId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["videoClips", playerId] }),
  });
}
