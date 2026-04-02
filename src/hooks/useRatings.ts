import { useQuery } from "@tanstack/react-query";
import type { PlayerRating } from "@/types";
import { fetchTestSessions, fetchPlayerRating } from "@/api/players";
import ratingsData from "@/mocks/ratings.json";

const mockRatings = ratingsData as PlayerRating[];

export function usePlayerRating(playerId: string) {
  return useQuery({
    queryKey: ["ratings", playerId],
    queryFn: async (): Promise<PlayerRating | null> => {
      try {
        const [rating, sessions] = await Promise.all([
          fetchPlayerRating(playerId),
          fetchTestSessions(playerId),
        ]);
        const latestSession = sessions[0];
        return {
          playerId,
          skills: {
            skating: rating.rating * 0.15,
            shooting: rating.rating * 0.2,
            passing: rating.rating * 0.15,
            defense: rating.rating * 0.15,
            physical: rating.rating * 0.2,
            vision: rating.rating * 0.15,
          },
          history: [],
          tests: {
            sprint20mFwd: latestSession?.sprint_20m_fwd ?? 0,
            sprint20mBwd: latestSession?.sprint_20m_bwd ?? 0,
            sprint60m: latestSession?.sprint_60m ?? undefined,
            standingJump: latestSession?.standing_jump ?? 0,
            longJump: latestSession?.long_jump ?? undefined,
            agility: latestSession?.agility ?? 0,
            flexibility: latestSession?.flexibility ?? 0,
            pushUps: latestSession?.push_ups ?? undefined,
            pullUps: latestSession?.pull_ups ?? undefined,
            plankSec: latestSession?.plank_sec ?? undefined,
            balanceTestSec: latestSession?.balance_test_sec ?? undefined,
          },
        };
      } catch {
        return mockRatings.find((r) => r.playerId === playerId) ?? mockRatings[0] ?? null;
      }
    },
    enabled: !!playerId,
    staleTime: 30_000,
  });
}
