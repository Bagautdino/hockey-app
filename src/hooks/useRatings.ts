import { useQuery } from "@tanstack/react-query";
import type { PlayerRating } from "@/types";
import ratingsData from "@/mocks/ratings.json";

const ratings = ratingsData as PlayerRating[];

export function usePlayerRating(playerId: string) {
  return useQuery({
    queryKey: ["ratings", playerId],
    queryFn: () => ratings.find((r) => r.playerId === playerId) ?? null,
    enabled: !!playerId,
  });
}
