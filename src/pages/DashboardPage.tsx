import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePlayer } from "@/hooks/usePlayers";
import { usePlayerRating } from "@/hooks/useRatings";
import { Video, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { formatDate, getAge, positionLabel, ratingBadgeVariant } from "@/lib/utils";

const MOCK_PARENT_PLAYER_ID = "1";

const recentTests = [
  { label: "Бег 20м вперёд", value: "3.42 сек", date: "10.07.2024" },
  { label: "Бег 20м назад", value: "4.15 сек", date: "10.07.2024" },
  { label: "Прыжок с места", value: "178 см", date: "10.07.2024" },
  { label: "Ловкость", value: "8.2 сек", date: "10.07.2024" },
];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
          <p className="text-sm text-gray-500">Добро пожаловать обратно!</p>
        </div>
        <Button
          onClick={() => navigate("/player/new")}
          variant="outline"
          className="hidden sm:flex"
          aria-label="Добавить видео"
        >
          <Video className="mr-2 h-4 w-4" />
          Добавить видео
        </Button>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-white/30">
              <AvatarImage src={player.avatar} alt={`${player.firstName} ${player.lastName}`} />
              <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                {player.firstName[0]}{player.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">
                {player.firstName} {player.lastName}
              </h2>
              <p className="text-blue-100 text-sm">
                {positionLabel(player.position)} · {getAge(player.birthDate)} лет · {player.region}
              </p>
              <p className="text-blue-200 text-xs mt-1">
                День рождения: {formatDate(player.birthDate)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{player.rating}</div>
              <Badge
                variant={ratingBadgeVariant(player.rating)}
                className="mt-1 bg-white/20 text-white border-white/30"
              >
                Рейтинг
              </Badge>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              size="sm"
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              variant="outline"
              onClick={() => navigate(`/player/${player.id}`)}
              aria-label="Открыть профиль игрока"
            >
              Открыть профиль
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 text-white hover:bg-amber-600 border-0 sm:flex hidden"
              onClick={() => navigate("/player/new")}
            >
              <Video className="mr-1.5 h-4 w-4" />
              Добавить видео
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Прогресс рейтинга
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={rating.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [`${value}`, "Рейтинг"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1d4ed8"
                  strokeWidth={2.5}
                  dot={{ fill: "#1d4ed8", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-blue-600" />
              Последние тесты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {recentTests.map((test) => (
                <li key={test.label} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{test.label}</p>
                    <p className="text-xs text-gray-400">{test.date}</p>
                  </div>
                  <span className="font-semibold text-blue-700">{test.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden">
        <Button
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          onClick={() => navigate("/player/new")}
          aria-label="Добавить видео"
        >
          <Video className="mr-2 h-4 w-4" />
          Добавить видео
        </Button>
      </div>
    </div>
  );
}
