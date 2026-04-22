import { api } from "./client";
import type { Video } from "@/types";

interface ApiVideo {
  id: string;
  player_id: string;
  title: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  duration_sec?: number | null;
  skill_tag?: string | null;
  status: string;
  uploaded_at: string;
  rating?: number | null;
  assessment_date?: string | null;
  comment?: string | null;
  training_plan?: string | null;
  is_assessment?: boolean | null;
}

function getYouTubeThumbnail(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
}

function mapApiVideo(v: ApiVideo): Video {
  const mins = v.duration_sec ? Math.floor(v.duration_sec / 60) : 0;
  const secs = v.duration_sec ? v.duration_sec % 60 : 0;
  const videoUrl = v.video_url ?? undefined;
  const thumbnail =
    v.thumbnail_url ?? (videoUrl ? getYouTubeThumbnail(videoUrl) : "");
  return {
    id: v.id,
    playerId: v.player_id,
    title: v.title,
    thumbnail,
    duration: v.duration_sec
      ? `${mins}:${String(secs).padStart(2, "0")}`
      : "0:00",
    uploadedAt: v.uploaded_at,
    videoUrl,
    rating: v.rating ?? undefined,
    assessmentDate: v.assessment_date ?? undefined,
    comment: v.comment ?? undefined,
    trainingPlan: v.training_plan ?? undefined,
    isAssessment: v.is_assessment ?? undefined,
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
  const { data } = await api.get<{ url: string }>(
    `/api/v1/videos/${videoId}/url`,
  );
  return data.url;
}

export async function addVideoLink(
  playerId: string,
  title: string,
  videoUrl: string,
  skillTag?: string,
): Promise<{ id: string }> {
  const { data } = await api.post(
    `/api/v1/players/${playerId}/video-links`,
    { title, video_url: videoUrl, skill_tag: skillTag },
  );
  return data;
}

export async function createAssessment(
  playerId: string,
  body: {
    title: string;
    video_url: string;
    rating?: number;
    comment?: string;
    training_plan?: string;
  },
): Promise<{ id: string; status: string; message: string }> {
  const { data } = await api.post(
    `/api/v1/players/${playerId}/assessments`,
    body,
  );
  return data;
}
