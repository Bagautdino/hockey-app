import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@/types";
import { fetchPlayerVideos, uploadVideo } from "@/api/videos";
import videosData from "@/mocks/videos.json";

const mockVideos = videosData as Video[];

export function usePlayerVideos(playerId: string) {
  const fallback = mockVideos.filter((v) => v.playerId === playerId);
  return useQuery({
    queryKey: ["videos", playerId],
    queryFn: async () => {
      try {
        const result = await fetchPlayerVideos(playerId);
        return result.length > 0 ? result : fallback;
      } catch {
        return fallback;
      }
    },
    enabled: !!playerId,
    placeholderData: fallback,
  });
}

export function useUploadVideo(playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title, skillTag }: { file: File; title: string; skillTag?: string }) =>
      uploadVideo(playerId, file, title, skillTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos", playerId] });
    },
  });
}
