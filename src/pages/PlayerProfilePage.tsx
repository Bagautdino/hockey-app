import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PercentileBadge } from "@/components/player/PercentileBadge";
import { usePlayer, useCreateTestSession } from "@/hooks/usePlayers";
import { usePlayerRating } from "@/hooks/useRatings";
import { usePlayerVideos, useAddVideoLink } from "@/hooks/useVideos";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  formatDate,
  getAge,
  positionLabel,
  ratingBadgeVariant,
  handLabel,
} from "@/lib/utils";
import { ArrowLeft, Play, Plus, Link, ClipboardList } from "lucide-react";
import type { Video, AgeNormFields } from "@/types";
import ageNormsData from "@/mocks/ageNorms.json";

const ageNormsMap = ageNormsData as Record<string, AgeNormFields>;

const testSessionSchema = z.object({
  sprint_20m_fwd: z.coerce.number().min(2).max(10).optional().or(z.literal("")),
  sprint_20m_bwd: z.coerce.number().min(2).max(12).optional().or(z.literal("")),
  sprint_60m: z.coerce.number().min(5).max(20).optional().or(z.literal("")),
  standing_jump: z.coerce.number().min(50).max(300).optional().or(z.literal("")),
  long_jump: z.coerce.number().min(80).max(350).optional().or(z.literal("")),
  agility: z.coerce.number().min(4).max(20).optional().or(z.literal("")),
  flexibility: z.coerce.number().min(-20).max(40).optional().or(z.literal("")),
  push_ups: z.coerce.number().int().min(0).max(100).optional().or(z.literal("")),
  pull_ups: z.coerce.number().int().min(0).max(50).optional().or(z.literal("")),
  plank_sec: z.coerce.number().min(0).max(600).optional().or(z.literal("")),
  balance_test_sec: z.coerce.number().min(0).max(300).optional().or(z.literal("")),
});

type TestSessionFormValues = z.infer<typeof testSessionSchema>;

const TEST_FIELDS: Array<{
  key: keyof TestSessionFormValues;
  label: string;
  unit: string;
  step?: string;
}> = [
  { key: "sprint_20m_fwd", label: "Бег 20м вперёд", unit: "сек", step: "0.01" },
  { key: "sprint_20m_bwd", label: "Бег 20м назад", unit: "сек", step: "0.01" },
  { key: "sprint_60m", label: "Бег 60м", unit: "сек", step: "0.01" },
  { key: "standing_jump", label: "Прыжок с места", unit: "см" },
  { key: "long_jump", label: "Тройной прыжок", unit: "см" },
  { key: "agility", label: "Ловкость", unit: "сек", step: "0.01" },
  { key: "flexibility", label: "Гибкость", unit: "см", step: "0.5" },
  { key: "push_ups", label: "Отжимания", unit: "раз" },
  { key: "pull_ups", label: "Подтягивания", unit: "раз" },
  { key: "plank_sec", label: "Планка", unit: "сек" },
  { key: "balance_test_sec", label: "Равновесие", unit: "сек", step: "0.1" },
];

function AddTestSessionDialog({
  playerId,
  open,
  onClose,
}: {
  playerId: string;
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useCreateTestSession(playerId);
  const { register, handleSubmit, reset } = useForm<TestSessionFormValues>({
    resolver: zodResolver(testSessionSchema),
  });

  const onSubmit = async (data: TestSessionFormValues) => {
    const body: Record<string, number | undefined> = {};
    for (const field of TEST_FIELDS) {
      const val = data[field.key];
      if (val !== "" && val != null) {
        body[field.key] = Number(val);
      }
    }
    await mutation.mutateAsync(body);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md border-white/10 bg-[#111] max-h-[80vh] overflow-y-auto"
        aria-describedby="add-test-desc"
      >
        <DialogHeader>
          <DialogTitle className="text-white">Новая тест-сессия</DialogTitle>
          <DialogDescription id="add-test-desc" className="text-white/40">
            Заполните результаты последнего тестирования. Все поля необязательны.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {TEST_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <Label className="w-40 shrink-0 text-sm text-white/60">
                {f.label}
              </Label>
              <Input
                type="number"
                step={f.step ?? "1"}
                placeholder={f.unit}
                className="flex-1"
                aria-label={f.label}
                {...register(f.key)}
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/15 text-white/60 hover:bg-white/5"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const ANTHRO_FIELDS: Array<{
  key: string;
  label: string;
  unit: string;
}> = [
  { key: "height", label: "Рост", unit: "см" },
  { key: "weight", label: "Вес", unit: "кг" },
  { key: "armSpan", label: "Размах рук", unit: "см" },
  { key: "shoulderWidth", label: "Ширина плеч", unit: "см" },
  { key: "legLength", label: "Длина ноги", unit: "см" },
  { key: "torsoLength", label: "Длина туловища", unit: "см" },
  { key: "sittingHeight", label: "Высота сидя", unit: "см" },
  { key: "shoeSize", label: "Размер обуви", unit: "" },
  { key: "bodyFatPct", label: "Процент жира", unit: "%" },
];

interface TestRow {
  label: string;
  value: number | undefined;
  unit: string;
}

interface TestGroup {
  title: string;
  rows: TestRow[];
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
}

function VideoPlayer({ url }: { url: string }) {
  const youtubeEmbed = getYouTubeEmbedUrl(url);

  if (youtubeEmbed) {
    return (
      <iframe
        src={youtubeEmbed}
        className="aspect-video w-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video player"
      />
    );
  }

  if (isDirectVideoUrl(url)) {
    return (
      <video
        src={url}
        controls
        className="aspect-video w-full rounded-lg bg-black"
        controlsList="nodownload"
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-lg bg-black">
      <Link className="mx-auto mb-3 h-8 w-8 text-white/30" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[#dbad7b] hover:underline"
      >
        Открыть видео в новой вкладке
      </a>
    </div>
  );
}

function VideoDialog({
  video,
  open,
  onClose,
}: {
  video: Video | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!video) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-3xl border-white/10 bg-[#111] p-0 overflow-hidden"
        aria-describedby="video-dialog-desc"
      >
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-white">{video.title}</DialogTitle>
          <DialogDescription id="video-dialog-desc" className="text-white/40">
            Загружено: {video.uploadedAt} · Длительность: {video.duration}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          {video.videoUrl ? (
            <VideoPlayer url={video.videoUrl} />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-black">
              <div className="text-center text-white/30">
                <Play className="mx-auto mb-2 h-12 w-12" />
                <p className="text-sm">Ссылка на видео отсутствует</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const addVideoSchema = z.object({
  title: z.string().min(2, "Минимум 2 символа"),
  videoUrl: z.string().url("Введите корректную ссылку"),
});

type AddVideoForm = z.infer<typeof addVideoSchema>;

function AddVideoDialog({
  playerId,
  open,
  onClose,
}: {
  playerId: string;
  open: boolean;
  onClose: () => void;
}) {
  const addVideo = useAddVideoLink(playerId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddVideoForm>({
    resolver: zodResolver(addVideoSchema),
  });

  const onSubmit = async (data: AddVideoForm) => {
    await addVideo.mutateAsync({
      title: data.title,
      videoUrl: data.videoUrl,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md border-white/10 bg-[#111]"
        aria-describedby="add-video-desc"
      >
        <DialogHeader>
          <DialogTitle className="text-white">Добавить видео</DialogTitle>
          <DialogDescription id="add-video-desc" className="text-white/40">
            Вставьте ссылку на YouTube, VK Видео или прямую ссылку на mp4
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-white/70">Название</Label>
            <Input
              placeholder="Тренировка — бросок"
              aria-label="Название видео"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">Ссылка на видео</Label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              aria-label="Ссылка на видео"
              {...register("videoUrl")}
            />
            {errors.videoUrl && (
              <p className="text-xs text-red-400">{errors.videoUrl.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/15 text-white/60 hover:bg-white/5"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68]"
              disabled={addVideo.isPending}
            >
              {addVideo.isPending ? "Добавление..." : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: player } = usePlayer(id ?? "");
  const { data: rating } = usePlayerRating(id ?? "");
  const { data: videos = [] } = usePlayerVideos(id ?? "");
  const currentUser = useCurrentUser();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const isOwner = currentUser?.id === player?.parentId;

  if (!player || !rating) {
    return (
      <div className="flex h-64 items-center justify-center text-white/30">
        Загрузка профиля...
      </div>
    );
  }

  const age = getAge(player.birthDate);
  const norms = ageNormsMap[String(age)];
  const { anthropometrics: anthro } = player;

  const testGroups: TestGroup[] = [
    {
      title: "Скоростные качества",
      rows: [
        { label: "Бег 20м вперёд", value: rating.tests.sprint20mFwd, unit: "сек" },
        { label: "Бег 20м назад", value: rating.tests.sprint20mBwd, unit: "сек" },
        { label: "Бег 60м", value: rating.tests.sprint60m, unit: "сек" },
      ],
    },
    {
      title: "Взрывная сила",
      rows: [
        { label: "Прыжок с места", value: rating.tests.standingJump, unit: "см" },
        { label: "Тройной прыжок", value: rating.tests.longJump, unit: "см" },
      ],
    },
    {
      title: "Координация и гибкость",
      rows: [
        { label: "Ловкость", value: rating.tests.agility, unit: "сек" },
        { label: "Гибкость", value: rating.tests.flexibility, unit: "см" },
        { label: "Равновесие", value: rating.tests.balanceTestSec, unit: "сек" },
      ],
    },
    {
      title: "Силовая выносливость",
      rows: [
        { label: "Отжимания", value: rating.tests.pushUps, unit: "раз" },
        { label: "Подтягивания", value: rating.tests.pullUps, unit: "раз" },
        { label: "Планка", value: rating.tests.plankSec, unit: "сек" },
      ],
    },
  ];

  const bioFields = [
    { label: "Позиция", value: positionLabel(player.position) },
    { label: "Хват", value: handLabel(player.shootingHand) },
    { label: "Город", value: player.city },
    { label: "Регион", value: player.region },
    ...(player.team ? [{ label: "Команда", value: player.team }] : []),
    ...(player.jerseyNumber != null
      ? [{ label: "Номер", value: `#${player.jerseyNumber}` }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="-ml-2 text-white/40 hover:text-white hover:bg-white/5"
        onClick={() => navigate(-1)}
        aria-label="Вернуться назад"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Назад
      </Button>

      <Tabs defaultValue="profile">
        <TabsList className="w-full sm:w-auto bg-white/[0.06] border border-white/10">
          <TabsTrigger value="profile" className="flex-1 sm:flex-none data-[state=active]:bg-[#dbad7b]/20 data-[state=active]:text-[#dbad7b]">
            Профиль
          </TabsTrigger>
          <TabsTrigger value="anthropometrics" className="flex-1 sm:flex-none data-[state=active]:bg-[#dbad7b]/20 data-[state=active]:text-[#dbad7b]">
            Антропометрия
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex-1 sm:flex-none data-[state=active]:bg-[#dbad7b]/20 data-[state=active]:text-[#dbad7b]">
            Физтесты
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 sm:flex-none data-[state=active]:bg-[#dbad7b]/20 data-[state=active]:text-[#dbad7b]">
            Видео
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="border-white/10 bg-white/[0.04]">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 ring-4 ring-[#dbad7b]/20">
                  <AvatarImage
                    src={player.avatar}
                    alt={`${player.firstName} ${player.lastName}`}
                  />
                  <AvatarFallback className="bg-[#dbad7b]/20 text-[#dbad7b] text-2xl font-bold">
                    {player.firstName[0]}
                    {player.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">
                      {player.firstName} {player.lastName}
                    </h1>
                    <Badge
                      variant={ratingBadgeVariant(player.rating)}
                      className="text-sm"
                    >
                      {player.rating}
                    </Badge>
                  </div>
                  <p className="mt-1 text-white/50">
                    {positionLabel(player.position)} · {age} лет
                  </p>
                  <p className="mt-1 text-sm text-white/30">
                    {formatDate(player.birthDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-base text-white">Информация</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-white/5">
                {bioFields.map((field) => (
                  <div
                    key={field.label}
                    className="flex justify-between py-2.5"
                  >
                    <dt className="text-sm text-white/40">{field.label}</dt>
                    <dd className="font-semibold text-white">
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anthropometrics" className="mt-4">
          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-base text-white">Антропометрия</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full" data-testid="anthro-table">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-white/30">
                    <th className="pb-2 font-medium">Параметр</th>
                    <th className="pb-2 font-medium">Значение</th>
                    <th className="pb-2 font-medium text-right">Перцентиль</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ANTHRO_FIELDS.map((field) => {
                    const val =
                      anthro[field.key as keyof typeof anthro];
                    if (val == null) return null;
                    const norm = norms?.[field.key];
                    return (
                      <tr key={field.key}>
                        <td className="py-2.5 text-sm text-white/40">
                          {field.label}
                        </td>
                        <td className="py-2.5 font-semibold text-white">
                          {val}
                          {field.unit ? ` ${field.unit}` : ""}
                        </td>
                        <td className="py-2.5 text-right">
                          {norm ? (
                            <PercentileBadge
                              value={val}
                              ageNorm={norm}
                            />
                          ) : (
                            <span className="text-xs text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="mt-4 space-y-4">
          {isOwner && (
            <Button
              onClick={() => setShowAddTest(true)}
              className="bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68]"
              aria-label="Обновить показатели"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Обновить показатели
            </Button>
          )}
          {testGroups.map((group) => {
            const filledRows = group.rows.filter(
              (r) => r.value != null
            );
            if (filledRows.length === 0) return null;
            return (
              <Card key={group.title} className="border-white/10 bg-white/[0.04]">
                <CardHeader>
                  <CardTitle className="text-base text-white" data-testid="test-group-title">
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-white/5">
                    {filledRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between py-2.5"
                      >
                        <dt className="text-sm text-white/40">
                          {row.label}
                        </dt>
                        <dd className="font-semibold text-white">
                          {row.value} {row.unit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="videos" className="mt-4 space-y-4">
          {isOwner && (
            <Button
              onClick={() => setShowAddVideo(true)}
              className="bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68]"
              aria-label="Добавить видео"
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить видео
            </Button>
          )}
          {videos.length === 0 ? (
            <Card className="border-white/10 bg-white/[0.04]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-white/30">
                <Play className="mb-3 h-12 w-12 opacity-30" />
                <p>Видео пока не добавлены</p>
                {isOwner && (
                  <p className="mt-2 text-sm">
                    Добавьте ссылку на YouTube или другое видео
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="video-grid"
            >
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="cursor-pointer overflow-hidden border-white/10 bg-white/[0.04] transition-all hover:border-[#dbad7b]/30"
                  onClick={() => setSelectedVideo(video)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Открыть видео ${video.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedVideo(video);
                    }
                  }}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-44 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dbad7b]/90 shadow">
                        <Play className="ml-1 h-5 w-5 text-black" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      {video.duration}
                    </span>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-white/80 line-clamp-2">
                      {video.title}
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      {video.uploadedAt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <VideoDialog
        video={selectedVideo}
        open={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
      />

      {id && (
        <>
          <AddVideoDialog
            playerId={id}
            open={showAddVideo}
            onClose={() => setShowAddVideo(false)}
          />
          <AddTestSessionDialog
            playerId={id}
            open={showAddTest}
            onClose={() => setShowAddTest(false)}
          />
        </>
      )}
    </div>
  );
}
