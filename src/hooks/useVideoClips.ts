import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { VideoClip } from "@/types";
import {
  fetchVideoClips,
  createVideoClip,
  deleteVideoClip,
} from "@/api/videoClips";
import videoClipsData from "@/mocks/videoClips.json";

const mockVideoClips = videoClipsData as VideoClip[];

const MOCK_PLAYER_IDS = [...new Set(mockVideoClips.map((v) => v.playerId))];

function getMockVideoClipsForPlayer(playerId: string): VideoClip[] {
  const direct = mockVideoClips.filter((v) => v.playerId === playerId);
  if (direct.length > 0) return direct;

  const hash = [...playerId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mockId = MOCK_PLAYER_IDS[hash % MOCK_PLAYER_IDS.length];
  return mockVideoClips
    .filter((v) => v.playerId === mockId)
    .map((v) => ({ ...v, playerId }));
}

export function useVideoClips(playerId: string, category?: string) {
  return useQuery({
    queryKey: ["videoClips", playerId, category],
    queryFn: async () => {
      try {
        const result = await fetchVideoClips(playerId, category);
        if (result.length > 0) return result;
      } catch {}
      let clips = getMockVideoClipsForPlayer(playerId);
      if (category) {
        clips = clips.filter((c) => c.category === category);
      }
      return clips;
    },
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
