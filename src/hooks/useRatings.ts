import { useQuery } from "@tanstack/react-query";
import type { PlayerRating, HistoryPoint } from "@/types";
import { fetchTestSessions, fetchPlayerRating } from "@/api/players";
import ratingsData from "@/mocks/ratings.json";

const mockRatings = ratingsData as PlayerRating[];

const MONTH_NAMES = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

export function usePlayerRating(playerId: string) {
  return useQuery({
    queryKey: ["rating", playerId],
    queryFn: async (): Promise<PlayerRating | null> => {
      try {
        const [rating, sessions] = await Promise.all([
          fetchPlayerRating(playerId),
          fetchTestSessions(playerId),
        ]);
        const sorted = [...sessions].sort(
          (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
        );
        const latestSession = sorted[sorted.length - 1];

        const history: HistoryPoint[] = sorted.map((s, i) => {
          const d = new Date(s.recorded_at);
          const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear() % 100}`;
          const baseScore = rating.rating - (sorted.length - 1 - i) * 3;
          return { date: label, score: Math.max(0, Math.round(baseScore)) };
        });

        if (history.length === 0) {
          history.push({ date: MONTH_NAMES[new Date().getMonth()], score: Math.round(rating.rating) });
        }

        return {
          playerId,
          skills: {
            skating: Math.round(rating.rating * 0.15),
            shooting: Math.round(rating.rating * 0.2),
            passing: Math.round(rating.rating * 0.15),
            defense: Math.round(rating.rating * 0.15),
            physical: Math.round(rating.rating * 0.2),
            vision: Math.round(rating.rating * 0.15),
          },
          history,
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
        return (
          mockRatings.find((r) => r.playerId === playerId) ??
          mockRatings[0] ??
          null
        );
      }
    },
    enabled: !!playerId,
    staleTime: 30_000,
  });
}
