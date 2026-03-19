import { useParams, useNavigate } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePlayer } from "@/hooks/usePlayers";
import { usePlayerRating } from "@/hooks/useRatings";
import { usePlayerVideos } from "@/hooks/useVideos";
import { formatDate, getAge, positionLabel, ratingBadgeVariant } from "@/lib/utils";
import { ArrowLeft, Play } from "lucide-react";

const skillLabels: Record<string, string> = {
  skating: "Катание",
  shooting: "Бросок",
  passing: "Пас",
  defense: "Защита",
  physical: "Физика",
  vision: "Видение",
};

export function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: player } = usePlayer(id ?? "");
  const { data: rating } = usePlayerRating(id ?? "");
  const { data: videos = [] } = usePlayerVideos(id ?? "");

  if (!player || !rating) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Загрузка профиля...
      </div>
    );
  }

  const radarData = Object.entries(rating.skills).map(([key, value]) => ({
    skill: skillLabels[key] ?? key,
    value,
  }));

  const anthropometrics = [
    { label: "Рост", value: `${player.height} см` },
    { label: "Вес", value: `${player.weight} кг` },
    { label: "Размах рук", value: `${player.armSpan} см` },
    { label: "Длина ноги", value: `${player.legLength} см` },
  ];

  const physicalTests = [
    { label: "Бег 20м вперёд", value: `${rating.tests.sprint20mFwd} сек` },
    { label: "Бег 20м назад", value: `${rating.tests.sprint20mBwd} сек` },
    { label: "Прыжок с места", value: `${rating.tests.standingJump} см` },
    { label: "Ловкость", value: `${rating.tests.agility} сек` },
    { label: "Гибкость", value: `${rating.tests.flexibility} см` },
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

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 ring-4 ring-blue-100">
              <AvatarImage
                src={player.avatar}
                alt={`${player.firstName} ${player.lastName}`}
              />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                {player.firstName[0]}{player.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {player.firstName} {player.lastName}
                </h1>
                <Badge variant={ratingBadgeVariant(player.rating)} className="text-sm">
                  {player.rating}
                </Badge>
              </div>
              <p className="mt-1 text-gray-500">
                {positionLabel(player.position)} · {getAge(player.birthDate)} лет
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                <span>📅 {formatDate(player.birthDate)}</span>
                <span>📍 {player.region}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stats">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="stats" className="flex-1 sm:flex-none">Статистика</TabsTrigger>
          <TabsTrigger value="anthropometrics" className="flex-1 sm:flex-none">Параметры</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 sm:flex-none">Видео</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Радар навыков</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <Radar
                    name="Навыки"
                    dataKey="value"
                    stroke="#1d4ed8"
                    fill="#1d4ed8"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v: number) => [`${v}`, "Балл"]}
                  />
                </RadarChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.entries(rating.skills).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">{skillLabels[key]}</p>
                    <p className="text-xl font-bold text-blue-700">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anthropometrics" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Антропометрия</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-100">
                  {anthropometrics.map((item) => (
                    <div key={item.label} className="flex justify-between py-2.5">
                      <dt className="text-sm text-gray-500">{item.label}</dt>
                      <dd className="font-semibold text-gray-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Физические тесты</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-100">
                  {physicalTests.map((item) => (
                    <div key={item.label} className="flex justify-between py-2.5">
                      <dt className="text-sm text-gray-500">{item.label}</dt>
                      <dd className="font-semibold text-gray-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
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
                    <p className="font-medium text-sm text-gray-800 line-clamp-2">
                      {video.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{video.uploadedAt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
