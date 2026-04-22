import { api } from "./client";
import type { Review } from "@/types";

interface ApiReview {
  id: string;
  player_id: string;
  author_id: string;
  content: string;
  author_role: string;
  created_at: string;
}

function mapReview(r: ApiReview): Review {
  return {
    id: r.id,
    playerId: r.player_id,
    authorId: r.author_id,
    content: r.content,
    authorRole: r.author_role as Review["authorRole"],
    createdAt: r.created_at,
  };
}

export async function fetchReviews(playerId: string): Promise<Review[]> {
  const { data } = await api.get<ApiReview[]>(
    `/api/v1/players/${playerId}/reviews`,
  );
  return data.map(mapReview);
}

export async function createReview(
  playerId: string,
  body: { content: string; author_role: string },
): Promise<Review> {
  const { data } = await api.post<ApiReview>(
    `/api/v1/players/${playerId}/reviews`,
    body,
  );
  return mapReview(data);
}

export async function verifyDataEntry(entryId: string): Promise<void> {
  await api.post(`/api/v1/data-entries/${entryId}/verify`);
}
