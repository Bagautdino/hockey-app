import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { fetchPlayerVideos, addVideoLink, uploadVideo, getVideoUrl } from "./videos";
import { api } from "./client";

const mockedApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchPlayerVideos", () => {
  it("maps ApiVideo to Video with duration formatting", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: "v1",
          player_id: "p1",
          title: "Тренировка",
          video_url: "https://www.youtube.com/watch?v=abc12345678",
          thumbnail_url: null,
          duration_sec: 185,
          skill_tag: "skating",
          status: "ready",
          uploaded_at: "2024-07-10",
        },
      ],
    });

    const result = await fetchPlayerVideos("p1");

    expect(mockedApi.get).toHaveBeenCalledWith("/api/v1/players/p1/videos");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "v1",
      playerId: "p1",
      title: "Тренировка",
      duration: "3:05",
      videoUrl: "https://www.youtube.com/watch?v=abc12345678",
    });
  });

  it("generates YouTube thumbnail when thumbnail_url is null", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: "v2",
          player_id: "p1",
          title: "Бросок",
          video_url: "https://www.youtube.com/watch?v=K09-MqZoJ-M",
          thumbnail_url: null,
          duration_sec: 60,
          skill_tag: null,
          status: "ready",
          uploaded_at: "2024-07-01",
        },
      ],
    });

    const result = await fetchPlayerVideos("p1");
    expect(result[0].thumbnail).toBe(
      "https://img.youtube.com/vi/K09-MqZoJ-M/hqdefault.jpg"
    );
  });

  it("prefers explicit thumbnail_url over auto-generated", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: "v3",
          player_id: "p1",
          title: "Видео",
          video_url: "https://www.youtube.com/watch?v=abc12345678",
          thumbnail_url: "https://custom-thumb.jpg",
          duration_sec: 120,
          skill_tag: null,
          status: "ready",
          uploaded_at: "2024-06-15",
        },
      ],
    });

    const result = await fetchPlayerVideos("p1");
    expect(result[0].thumbnail).toBe("https://custom-thumb.jpg");
  });

  it("handles zero duration", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: "v4",
          player_id: "p1",
          title: "Без длительности",
          video_url: null,
          thumbnail_url: null,
          duration_sec: null,
          skill_tag: null,
          status: "ready",
          uploaded_at: "2024-06-01",
        },
      ],
    });

    const result = await fetchPlayerVideos("p1");
    expect(result[0].duration).toBe("0:00");
    expect(result[0].videoUrl).toBeUndefined();
  });

  it("handles youtu.be short links", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: "v5",
          player_id: "p1",
          title: "Короткая ссылка",
          video_url: "https://youtu.be/HV3HIiVuBDk",
          thumbnail_url: null,
          duration_sec: 90,
          skill_tag: null,
          status: "ready",
          uploaded_at: "2024-05-20",
        },
      ],
    });

    const result = await fetchPlayerVideos("p1");
    expect(result[0].thumbnail).toBe(
      "https://img.youtube.com/vi/HV3HIiVuBDk/hqdefault.jpg"
    );
  });
});

describe("addVideoLink", () => {
  it("sends correct payload with skill tag", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: "new-v1" } });

    const result = await addVideoLink(
      "p1",
      "Матч",
      "https://youtube.com/watch?v=abc",
      "shooting"
    );

    expect(mockedApi.post).toHaveBeenCalledWith(
      "/api/v1/players/p1/video-links",
      { title: "Матч", video_url: "https://youtube.com/watch?v=abc", skill_tag: "shooting" }
    );
    expect(result).toEqual({ id: "new-v1" });
  });

  it("sends correct payload without skill tag", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: "new-v2" } });

    await addVideoLink("p2", "Тренировка", "https://example.com/vid.mp4");

    expect(mockedApi.post).toHaveBeenCalledWith(
      "/api/v1/players/p2/video-links",
      { title: "Тренировка", video_url: "https://example.com/vid.mp4", skill_tag: undefined }
    );
  });
});

describe("uploadVideo", () => {
  it("sends FormData with file, title and skill_tag", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: "upl-1" } });
    const file = new File(["video"], "test.mp4", { type: "video/mp4" });

    const result = await uploadVideo("p1", file, "Мой бросок", "shooting");

    expect(mockedApi.post).toHaveBeenCalledTimes(1);
    const [url, formData, config] = mockedApi.post.mock.calls[0];
    expect(url).toBe("/api/v1/players/p1/videos");
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get("title")).toBe("Мой бросок");
    expect((formData as FormData).get("skill_tag")).toBe("shooting");
    expect(config).toEqual({ headers: { "Content-Type": "multipart/form-data" } });
    expect(result).toEqual({ id: "upl-1" });
  });
});

describe("getVideoUrl", () => {
  it("returns presigned URL", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { url: "https://s3.example.com/video.mp4?token=abc" },
    });

    const url = await getVideoUrl("v1");
    expect(url).toBe("https://s3.example.com/video.mp4?token=abc");
    expect(mockedApi.get).toHaveBeenCalledWith("/api/v1/videos/v1/url");
  });
});
