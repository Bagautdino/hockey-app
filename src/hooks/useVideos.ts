import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@/types";
import { fetchPlayerVideos, uploadVideo } from "@/api/videos";
import videosData from "@/mocks/videos.json";

const mockVideos = videosData as Video[];

function useApiMode(): boolean {
  try {
    return !!globalThis.localStorage?.getItem("access_token");
  } catch {
    return false;
  }
}

export function usePlayerVideos(playerId: string) {
  const apiMode = useApiMode();
  return useQuery({
    queryKey: ["videos", playerId],
    queryFn: () => fetchPlayerVideos(playerId),
    enabled: apiMode && !!playerId,
    ...(apiMode
      ? {}
      : {
          initialData: mockVideos.filter((v) => v.playerId === playerId),
        }),
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
