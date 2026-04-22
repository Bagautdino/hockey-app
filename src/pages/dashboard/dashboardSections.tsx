import {
  Trophy,
  Heart,
  Target,
  TrendingUp,
  AlertTriangle,
  Activity,
  Crosshair,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/StatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendChart } from "@/components/shared";
import { cn, formatDate } from "@/lib/utils";
import type { Injury } from "@/types";
import type { ActivityFeedItem } from "./dashboardUtils";

export type { ActivityFeedItem };

export function DashboardPlayerSelect({
  players,
  value,
  onChange,
}: {
  players: { id: string; firstName: string; lastName: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (players.length <= 1) return null;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="w-full max-w-xs border-white/10 bg-white/[0.06] text-white sm:w-[280px]"
        aria-label="Выбор игрока"
      >
        <SelectValue placeholder="Игрок" />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[#1a1a1a] text-white">
        {players.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.firstName} {p.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DashboardStatsOverview({
  overallRating,
  ratingDelta,
  gamesPlayed,
  activeInjuries,
  daysSinceLastTest,
}: {
  overallRating: string | number;
  ratingDelta?: number;
  gamesPlayed: string | number;
  activeInjuries: string | number;
  daysSinceLastTest: string | number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Общий рейтинг"
        value={overallRating}
        unit="балл."
        delta={ratingDelta}
        deltaLabel="к пред. точке"
      />
      <StatCard title="Сыграно матчей" value={gamesPlayed} />
      <StatCard title="Активные травмы" value={activeInjuries} />
      <StatCard title="Дней с последнего теста" value={daysSinceLastTest} />
    </div>
  );
}

export function DashboardAchievements({
  bestResult,
  noInjuries,
  tenPlusGames,
  stableGrowth,
}: {
  bestResult: boolean;
  noInjuries: boolean;
  tenPlusGames: boolean;
  stableGrowth: boolean;
}) {
  const items = [
    {
      key: "best",
      title: "Лучший результат",
      desc: "Текущий рейтинг — максимум в истории",
      icon: Trophy,
      active: bestResult,
    },
    {
      key: "healthy",
      title: "Без травм",
      desc: "Нет травм в процессе восстановления",
      icon: Heart,
      active: noInjuries,
    },
    {
      key: "games",
      title: "10+ матчей",
      desc: "Суммарно сыграно не меньше 10 матчей",
      icon: Target,
      active: tenPlusGames,
    },
    {
      key: "growth",
      title: "Стабильный рост",
      desc: "Три последние точки рейтинга растут",
      icon: TrendingUp,
      active: stableGrowth,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ key, title, desc, icon: Icon, active }) => (
        <Card
          key={key}
          className={cn(
            "border-white/10 transition-colors",
            active
              ? "bg-gradient-to-br from-[#dbad7b]/15 to-white/[0.04] ring-1 ring-[#dbad7b]/30"
              : "bg-white/[0.03] opacity-60",
          )}
        >
          <CardContent className="flex gap-3 p-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                active ? "bg-[#dbad7b]/20 text-[#dbad7b]" : "bg-white/5 text-white/35",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-0.5 text-xs text-white/45">{desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardConcerns({
  declining,
  injuries,
}: {
  declining: { label: string; detail: string }[];
  injuries: Injury[];
}) {
  const showDecline = declining.length > 0;
  const showInj = injuries.length > 0;
  if (!showDecline && !showInj) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {showDecline && (
        <Card className="border-red-500/35 bg-red-500/[0.07]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Снижение показателей
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-red-100/80">
              По сравнению с прошлой тест-сессией часть метрик ухудшилась.
            </p>
            <ul className="space-y-1.5">
              {declining.map((d) => (
                <li
                  key={d.label}
                  className="flex items-center justify-between gap-2 rounded-md bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="text-white/90">{d.label}</span>
                  <Badge variant="destructive" className="shrink-0 font-mono text-xs">
                    {d.detail}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {showInj && (
        <Card className="border-amber-500/40 bg-amber-500/[0.08]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-amber-100">
              <Crosshair className="h-4 w-4 shrink-0 text-amber-400" />
              Активные травмы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {injuries.map((inj) => (
              <div
                key={inj.id}
                className="rounded-lg border border-amber-500/20 bg-black/15 p-3"
              >
                <p className="font-medium text-white">{inj.name}</p>
                {inj.description && (
                  <p className="mt-1 text-sm text-white/55">{inj.description}</p>
                )}
                <p className="mt-2 text-xs text-amber-200/70">
                  {formatDate(inj.injuryDate)}
                  {inj.recoveryDays != null ? ` · ~${inj.recoveryDays} дн. восст.` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function DashboardActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Activity className="h-4 w-4 text-[#dbad7b]" />
          Недавняя активность
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/35">
            Пока нет событий — добавьте тесты, травмы или статистику матчей.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((ev) => (
              <li key={ev.id} className="flex gap-3 py-3 first:pt-0" data-testid="activity-item">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#dbad7b]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{ev.title}</p>
                  {ev.subtitle && (
                    <p className="mt-0.5 text-xs text-white/45">{ev.subtitle}</p>
                  )}
                  <p className="mt-1 text-xs text-white/30">{formatDate(ev.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardAnthroPanel({
  weightSeries,
  heightSeries,
}: {
  weightSeries: { date: string; value: number }[];
  heightSeries: { date: string; value: number }[];
}) {
  const hasAny =
    (weightSeries.length > 0 || heightSeries.length > 0) &&
    (weightSeries.length >= 2 || heightSeries.length >= 2);
  if (!hasAny) return null;

  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white">Антропометрия</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        {weightSeries.length >= 2 && (
          <TrendChart
            data={weightSeries}
            label="Вес"
            unit="кг"
            color="#dbad7b"
            height={200}
          />
        )}
        {heightSeries.length >= 2 && (
          <TrendChart
            data={heightSeries}
            label="Рост"
            unit="см"
            color="#7eb8da"
            height={200}
          />
        )}
      </CardContent>
    </Card>
  );
}
