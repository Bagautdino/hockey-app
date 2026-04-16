import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@/types";
import { fetchPlayerVideos, uploadVideo, addVideoLink } from "@/api/videos";
import videosData from "@/mocks/videos.json";

const mockVideos = videosData as Video[];

const MOCK_PLAYER_IDS = [...new Set(mockVideos.map((v) => v.playerId))];

function getMockVideosForPlayer(playerId: string): Video[] {
  const direct = mockVideos.filter((v) => v.playerId === playerId);
  if (direct.length > 0) return direct;

  const hash = [...playerId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mockId = MOCK_PLAYER_IDS[hash % MOCK_PLAYER_IDS.length];
  return mockVideos
    .filter((v) => v.playerId === mockId)
    .map((v) => ({ ...v, playerId }));
}

export function usePlayerVideos(playerId: string) {
  return useQuery({
    queryKey: ["videos", playerId],
    queryFn: async () => {
      try {
        const result = await fetchPlayerVideos(playerId);
        if (result.length > 0) return result;
      } catch {
        /* fall through to mock */
      }
      return getMockVideosForPlayer(playerId);
    },
    enabled: !!playerId,
    staleTime: 30_000,
  });
}

export function useUploadVideo(playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      title,
      skillTag,
    }: {
      file: File;
      title: string;
      skillTag?: string;
    }) => uploadVideo(playerId, file, title, skillTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos", playerId] });
    },
  });
}

export function useAddVideoLink(playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      videoUrl,
      skillTag,
    }: {
      title: string;
      videoUrl: string;
      skillTag?: string;
    }) => addVideoLink(playerId, title, videoUrl, skillTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos", playerId] });
    },
  });
}
