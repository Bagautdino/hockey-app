import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { usePlayer } from "@/hooks/usePlayers";
import { usePlayerRating } from "@/hooks/useRatings";
import { usePlayerVideos } from "@/hooks/useVideos";
import {
  formatDate,
  getAge,
  positionLabel,
  ratingBadgeVariant,
  handLabel,
} from "@/lib/utils";
import { ArrowLeft, Play } from "lucide-react";
import type { Video, AgeNormFields } from "@/types";
import ageNormsData from "@/mocks/ageNorms.json";

const ageNormsMap = ageNormsData as Record<string, AgeNormFields>;

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
      <DialogContent className="max-w-2xl" aria-describedby="video-dialog-desc">
        <DialogHeader>
          <DialogTitle>{video.title}</DialogTitle>
          <DialogDescription id="video-dialog-desc">
            Загружено: {video.uploadedAt} · Длительность: {video.duration}
          </DialogDescription>
        </DialogHeader>
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-900">
          <div className="text-center text-gray-400">
            <Play className="mx-auto mb-2 h-12 w-12" />
            <p className="text-sm">Видеоплеер — заглушка</p>
          </div>
        </div>
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
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (!player || !rating) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
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
        className="-ml-2 text-gray-500"
        onClick={() => navigate(-1)}
        aria-label="Вернуться назад"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Назад
      </Button>

      <Tabs defaultValue="profile">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile" className="flex-1 sm:flex-none">
            Профиль
          </TabsTrigger>
          <TabsTrigger value="anthropometrics" className="flex-1 sm:flex-none">
            Антропометрия
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex-1 sm:flex-none">
            Физтесты
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 sm:flex-none">
            Видео
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 ring-4 ring-blue-100">
                  <AvatarImage
                    src={player.avatar}
                    alt={`${player.firstName} ${player.lastName}`}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                    {player.firstName[0]}
                    {player.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {player.firstName} {player.lastName}
                    </h1>
                    <Badge
                      variant={ratingBadgeVariant(player.rating)}
                      className="text-sm"
                    >
                      {player.rating}
                    </Badge>
                  </div>
                  <p className="mt-1 text-gray-500">
                    {positionLabel(player.position)} · {age} лет
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    📅 {formatDate(player.birthDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Информация</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-gray-100">
                {bioFields.map((field) => (
                  <div
                    key={field.label}
                    className="flex justify-between py-2.5"
                  >
                    <dt className="text-sm text-gray-500">{field.label}</dt>
                    <dd className="font-semibold text-gray-900">
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anthropometrics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Антропометрия</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full" data-testid="anthro-table">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-400">
                    <th className="pb-2 font-medium">Параметр</th>
                    <th className="pb-2 font-medium">Значение</th>
                    <th className="pb-2 font-medium text-right">Перцентиль</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ANTHRO_FIELDS.map((field) => {
                    const val =
                      anthro[field.key as keyof typeof anthro];
                    if (val == null) return null;
                    const norm = norms?.[field.key];
                    return (
                      <tr key={field.key}>
                        <td className="py-2.5 text-sm text-gray-500">
                          {field.label}
                        </td>
                        <td className="py-2.5 font-semibold text-gray-900">
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
                            <span className="text-xs text-gray-300">—</span>
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
          {testGroups.map((group) => {
            const filledRows = group.rows.filter(
              (r) => r.value != null
            );
            if (filledRows.length === 0) return null;
            return (
              <Card key={group.title}>
                <CardHeader>
                  <CardTitle className="text-base" data-testid="test-group-title">
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-gray-100">
                    {filledRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between py-2.5"
                      >
                        <dt className="text-sm text-gray-500">
                          {row.label}
                        </dt>
                        <dd className="font-semibold text-gray-900">
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

        <TabsContent value="videos" className="mt-4">
          {videos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Play className="mb-3 h-12 w-12 opacity-30" />
                <p>Видео пока не добавлены</p>
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
                  className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow">
                        <Play className="ml-1 h-5 w-5 text-blue-700" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      {video.duration}
                    </span>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">
                      {video.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
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
    </div>
  );
}
