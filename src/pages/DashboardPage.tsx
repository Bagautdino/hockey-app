import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { SkillRadarChart } from "@/components/charts/SkillRadarChart";
import { usePlayer } from "@/hooks/usePlayers";
import { usePlayerRating } from "@/hooks/useRatings";
import { getAge, positionLabel, formatDate } from "@/lib/utils";
import { Plus, ArrowUp, ArrowDown, Calendar } from "lucide-react";
import type { ProgressPoint } from "@/types";
import progressData from "@/mocks/progress.json";

const MOCK_PARENT_PLAYER_ID = "1";

const allProgress = progressData as Record<string, ProgressPoint[]>;

interface RecentTest {
  label: string;
  value: string;
  date: string;
  delta: number;
}

const recentTestSessions: RecentTest[][] = [
  [
    { label: "Бег 20м вперёд", value: "3.42 сек", date: "10.07.2024", delta: -0.08 },
    { label: "Бег 20м назад", value: "4.15 сек", date: "10.07.2024", delta: -0.12 },
    { label: "Прыжок с места", value: "178 см", date: "10.07.2024", delta: 5 },
    { label: "Ловкость", value: "8.2 сек", date: "10.07.2024", delta: -0.3 },
  ],
  [
    { label: "Бег 20м вперёд", value: "3.50 сек", date: "15.05.2024", delta: -0.05 },
    { label: "Бег 20м назад", value: "4.27 сек", date: "15.05.2024", delta: -0.1 },
    { label: "Прыжок с места", value: "173 см", date: "15.05.2024", delta: 3 },
    { label: "Ловкость", value: "8.5 сек", date: "15.05.2024", delta: -0.2 },
  ],
  [
    { label: "Бег 20м вперёд", value: "3.55 сек", date: "20.03.2024", delta: -0.03 },
    { label: "Бег 20м назад", value: "4.37 сек", date: "20.03.2024", delta: -0.08 },
    { label: "Прыжок с места", value: "170 см", date: "20.03.2024", delta: 4 },
    { label: "Ловкость", value: "8.7 сек", date: "20.03.2024", delta: -0.15 },
  ],
];

function DeltaArrow({ delta }: { delta: number }) {
  if (delta > 0) {
    return <ArrowUp className="h-3 w-3 text-green-600" aria-label="рост" />;
  }
  if (delta < 0) {
    return <ArrowDown className="h-3 w-3 text-green-600" aria-label="улучшение" />;
  }
  return null;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: player } = usePlayer(MOCK_PARENT_PLAYER_ID);
  const { data: rating } = usePlayerRating(MOCK_PARENT_PLAYER_ID);

  if (!player || !rating) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Загрузка...
      </div>
    );
  }

  const progress = allProgress[player.id] ?? rating.history.map((h) => ({
    month: h.date,
    rating: h.score,
  }));

  const lastRating = progress[progress.length - 1]?.rating ?? 0;
  const prevRating = progress[progress.length - 2]?.rating ?? lastRating;
  const ratingDelta = lastRating - prevRating;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 ring-2 ring-blue-100">
          <AvatarImage
            src={player.avatar}
            alt={`${player.firstName} ${player.lastName}`}
          />
          <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-bold">
            {player.firstName[0]}
            {player.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Добро пожаловать, {player.firstName}
          </h1>
          <p className="text-sm text-gray-500">
            {positionLabel(player.position)} · {getAge(player.birthDate)} лет ·{" "}
            {player.city}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Общий рейтинг"
          value={player.rating}
          unit="баллов"
          delta={ratingDelta}
          deltaLabel="за месяц"
        />
        <StatCard title="Позиция в регионе" value="3" unit={`из 24`} />
        <StatCard
          title="Последнее обновление"
          value={formatDate("2024-07-10")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Прогресс рейтинга</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={progress} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Навыки</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillRadarChart skills={rating.skills} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-blue-600" />
            Последние тесты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTestSessions.map((session, idx) => (
              <div key={idx} data-testid="test-session">
                <p className="mb-2 text-xs font-semibold text-gray-400">
                  {session[0]?.date}
                </p>
                <ul className="divide-y divide-gray-100">
                  {session.map((test) => (
                    <li
                      key={test.label}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-gray-700">{test.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {test.value}
                        </span>
                        <DeltaArrow delta={test.delta} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-700 shadow-lg hover:bg-blue-800 sm:h-auto sm:w-auto sm:rounded-lg sm:px-6"
        onClick={() => navigate("/player/new")}
        aria-label="Обновить показатели"
      >
        <Plus className="h-6 w-6 sm:mr-2 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Обновить показатели</span>
      </Button>
    </div>
  );
}
