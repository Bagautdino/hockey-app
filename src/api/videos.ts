import { api } from "./client";
import type { Video } from "@/types";

interface ApiVideo {
  id: string;
  player_id: string;
  title: string;
  thumbnail_url?: string | null;
  duration_sec?: number | null;
  skill_tag?: string | null;
  status: string;
  uploaded_at: string;
}

function mapApiVideo(v: ApiVideo): Video {
  const mins = v.duration_sec ? Math.floor(v.duration_sec / 60) : 0;
  const secs = v.duration_sec ? v.duration_sec % 60 : 0;
  return {
    id: v.id,
    playerId: v.player_id,
    title: v.title,
    thumbnail: v.thumbnail_url ?? "",
    duration: v.duration_sec ? `${mins}:${String(secs).padStart(2, "0")}` : "0:00",
    uploadedAt: v.uploaded_at,
  };
}

export async function fetchPlayerVideos(playerId: string): Promise<Video[]> {
  const { data } = await api.get<ApiVideo[]>(`/api/v1/players/${playerId}/videos`);
  return data.map(mapApiVideo);
}

export async function uploadVideo(
  playerId: string,
  file: File,
  title: string,
  skillTag?: string,
): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  if (skillTag) formData.append("skill_tag", skillTag);

  const { data } = await api.post(
    `/api/v1/players/${playerId}/videos`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function getVideoUrl(videoId: string): Promise<string> {
  const { data } = await api.get<{ url: string }>(`/api/v1/videos/${videoId}/url`);
  return data.url;
}
