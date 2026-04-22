import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { SkillRadarChart } from "@/components/charts/SkillRadarChart";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCurrentUser } from "@/hooks/useAuth";
import { usePlayer, usePlayers } from "@/hooks/usePlayers";
import { usePlayerRating, useTestSessions } from "@/hooks/useRatings";
import { useInjuries } from "@/hooks/useInjuries";
import { useGameStats } from "@/hooks/useGameStats";
import { useAnthroSnapshots } from "@/hooks/useAnthroSnapshots";
import { getAge, positionLabel } from "@/lib/utils";
import {
  DashboardAchievements,
  DashboardActivityFeed,
  DashboardAnthroPanel,
  DashboardConcerns,
  DashboardPlayerSelect,
  DashboardStatsOverview,
} from "@/pages/dashboard/dashboardSections";
import {
  anthroSeries,
  daysSince,
  getDecliningMetrics,
  historyToProgress,
  mergeActivityFeed,
} from "@/pages/dashboard/dashboardUtils";

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const first = players[0]?.id ?? "";
    if (!first) return;
    if (!selectedId || !players.some((p) => p.id === selectedId)) {
      setSelectedId(first);
    }
  }, [players, selectedId]);

  const { data: player } = usePlayer(selectedId);
  const { data: rating } = usePlayerRating(selectedId);
  const { data: injuries = [] } = useInjuries(selectedId);
  const { data: gameStats = [] } = useGameStats(selectedId);
  const { data: anthro = [] } = useAnthroSnapshots(selectedId);
  const { data: testSessions = [] } = useTestSessions(selectedId);

  const sortedSessions = useMemo(
    () =>
      [...testSessions].sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
      ),
    [testSessions],
  );

  const activeInjuries = useMemo(
    () => injuries.filter((i) => i.status === "in_progress"),
    [injuries],
  );

  const totalGames = useMemo(
    () => gameStats.reduce((s, g) => s + (g.gamesPlayed ?? 0), 0),
    [gameStats],
  );

  const history = rating?.history ?? [];
  const lastTestIso = sortedSessions[sortedSessions.length - 1]?.recorded_at;
  const daysSinceTest = daysSince(lastTestIso);

  const overall =
    history[history.length - 1]?.score ?? player?.rating ?? "—";
  const ratingDelta =
    history.length >= 2
      ? history[history.length - 1].score - history[history.length - 2].score
      : undefined;

  const progress = historyToProgress(history);
  const { weightSeries, heightSeries } = anthroSeries(anthro);

  const declining = getDecliningMetrics(
    sortedSessions[sortedSessions.length - 2],
    sortedSessions[sortedSessions.length - 1],
  );

  const activityItems = mergeActivityFeed({
    sessions: testSessions,
    injuries,
    gameStats,
  });

  const bestResult = useMemo(() => {
    if (!history.length) return true;
    const latest = history[history.length - 1].score;
    return latest >= Math.max(...history.map((h) => h.score));
  }, [history]);

  const stableGrowth =
    history.length >= 3 &&
    history[history.length - 3].score < history[history.length - 2].score &&
    history[history.length - 2].score < history[history.length - 1].score;

  if (playersLoading && !players.length) {
    return (
      <div className="flex h-64 items-center justify-center text-white/40">
        Загрузка...
      </div>
    );
  }

  if (!players.length) {
    return (
      <EmptyState
        icon={Users}
        title="Нет игроков"
        description="Добавьте профиль игрока, чтобы увидеть аналитику."
      />
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16 ring-2 ring-[#dbad7b]/35">
            <AvatarImage
              src={player?.avatar}
              alt={`${player?.firstName ?? ""} ${player?.lastName ?? ""}`}
            />
            <AvatarFallback className="bg-[#dbad7b]/20 text-lg font-bold text-[#dbad7b]">
              {player?.firstName?.[0] ?? "?"}
              {player?.lastName?.[0] ?? ""}
            </AvatarFallback>
          </Avatar>
          <PageHeader
            className="!block"
            title={`Добро пожаловать, ${player?.firstName ?? "—"}`}
            description={
              player
                ? [
                    `${positionLabel(player.position)} · ${getAge(player.birthDate)} лет · ${player.city}`,
                    user?.full_name,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Загрузка профиля..."
            }
          />
        </div>
        <DashboardPlayerSelect
          players={players}
          value={selectedId}
          onChange={setSelectedId}
        />
      </div>

      <DashboardStatsOverview
        overallRating={overall}
        ratingDelta={ratingDelta}
        gamesPlayed={totalGames}
        activeInjuries={activeInjuries.length}
        daysSinceLastTest={daysSinceTest ?? "—"}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#dbad7b]/90">
          Достижения
        </h2>
        <DashboardAchievements
          bestResult={bestResult}
          noInjuries={activeInjuries.length === 0}
          tenPlusGames={totalGames >= 10}
          stableGrowth={stableGrowth}
        />
      </section>

      <DashboardConcerns declining={declining} injuries={activeInjuries} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Прогресс рейтинга</CardTitle>
          </CardHeader>
          <CardContent>
            {progress.length > 1 ? (
              <ProgressChart data={progress} />
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-white/35">
                Недостаточно данных для графика. Добавьте тест-сессии.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Навыки</CardTitle>
          </CardHeader>
          <CardContent>
            {rating?.skills && Object.keys(rating.skills).length > 0 ? (
              <SkillRadarChart skills={rating.skills} />
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-white/35">
                Нет данных по навыкам
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DashboardAnthroPanel weightSeries={weightSeries} heightSeries={heightSeries} />

      <DashboardActivityFeed items={activityItems} />

      <Button
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#dbad7b] text-black shadow-lg shadow-[#dbad7b]/25 hover:bg-[#c89a68] sm:h-auto sm:w-auto sm:rounded-lg sm:px-6"
        onClick={() => selectedId && navigate(`/player/${selectedId}`)}
        disabled={!selectedId}
        aria-label="Обновить показатели"
      >
        <Plus className="h-6 w-6 sm:mr-2 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Обновить показатели</span>
      </Button>
    </div>
  );
}
