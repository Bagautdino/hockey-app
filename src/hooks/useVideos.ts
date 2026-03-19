import { useQuery } from "@tanstack/react-query";
import type { Video } from "@/types";
import videosData from "@/mocks/videos.json";

const videos = videosData as Video[];

export function usePlayerVideos(playerId: string) {
  return useQuery({
    queryKey: ["videos", playerId],
    queryFn: () => videos.filter((v) => v.playerId === playerId),
    enabled: !!playerId,
  });
}
