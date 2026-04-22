import { api } from "./client";
import type { VideoClip } from "@/types";

interface ApiVideoClip {
  id: string;
  player_id: string;
  uploader_id: string;
  title: string;
  s3_key?: string | null;
  video_url?: string | null;
  category: string;
  position_type: string;
  notes?: string | null;
  uploaded_at: string;
}

function mapClip(c: ApiVideoClip): VideoClip {
  return {
    id: c.id,
    playerId: c.player_id,
    uploaderId: c.uploader_id,
    title: c.title,
    videoUrl: c.video_url ?? undefined,
    category: c.category,
    positionType: c.position_type as VideoClip["positionType"],
    notes: c.notes ?? undefined,
    uploadedAt: c.uploaded_at,
  };
}

export async function fetchVideoClips(
  playerId: string,
  category?: string,
): Promise<VideoClip[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const { data } = await api.get<ApiVideoClip[]>(
    `/api/v1/players/${playerId}/video-clips${params}`,
  );
  return data.map(mapClip);
}

export async function createVideoClip(
  playerId: string,
  body: {
    title: string;
    video_url?: string;
    category: string;
    position_type: string;
    notes?: string;
  },
): Promise<VideoClip> {
  const { data } = await api.post<ApiVideoClip>(
    `/api/v1/players/${playerId}/video-clips`,
    body,
  );
  return mapClip(data);
}

export async function deleteVideoClip(clipId: string): Promise<void> {
  await api.delete(`/api/v1/video-clips/${clipId}`);
}
