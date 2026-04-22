import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReviews, createReview, verifyDataEntry } from "@/api/reviews";

export function useReviews(playerId: string) {
  return useQuery({
    queryKey: ["reviews", playerId],
    queryFn: () => fetchReviews(playerId),
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
