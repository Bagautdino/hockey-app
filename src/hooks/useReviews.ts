import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "@/types";
import { fetchReviews, createReview, verifyDataEntry } from "@/api/reviews";
import reviewsData from "@/mocks/reviews.json";

const mockReviews = reviewsData as Review[];

const MOCK_PLAYER_IDS = [...new Set(mockReviews.map((v) => v.playerId))];

function getMockReviewsForPlayer(playerId: string): Review[] {
  const direct = mockReviews.filter((v) => v.playerId === playerId);
  if (direct.length > 0) return direct;

  const hash = [...playerId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mockId = MOCK_PLAYER_IDS[hash % MOCK_PLAYER_IDS.length];
  return mockReviews
    .filter((v) => v.playerId === mockId)
    .map((v) => ({ ...v, playerId }));
}

export function useReviews(playerId: string) {
  return useQuery({
    queryKey: ["reviews", playerId],
    queryFn: async () => {
      try {
        const result = await fetchReviews(playerId);
        if (result.length > 0) return result;
      } catch {}
      return getMockReviewsForPlayer(playerId);
    },
    enabled: !!playerId,
    staleTime: 30_000,
  });
}

export function useCreateReview(playerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { content: string; author_role: string }) =>
      createReview(playerId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews", playerId] }),
  });
}

export function useVerifyDataEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => verifyDataEntry(entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
