import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@/types";
import { fetchPlayerVideos, uploadVideo } from "@/api/videos";
import videosData from "@/mocks/videos.json";

const mockVideos = videosData as Video[];

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
      return mockVideos.filter((v) => v.playerId === playerId);
    },
    enabled: !!playerId,
    staleTime: 30_000,
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
