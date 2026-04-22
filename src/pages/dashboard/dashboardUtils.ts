import type { ApiTestSession } from "@/api/players";
import type { GameStat, Injury, HistoryPoint, AnthroSnapshot } from "@/types";
import { formatDate } from "@/lib/utils";

export interface ActivityFeedItem {
  id: string;
  at: string;
  title: string;
  subtitle?: string;
}

const METRIC_CHECKS: Array<{
  key: keyof ApiTestSession;
  label: string;
  lowerIsBetter: boolean;
}> = [
  { key: "sprint_20m_fwd", label: "Бег 20м вперёд", lowerIsBetter: true },
  { key: "sprint_20m_bwd", label: "Бег 20м назад", lowerIsBetter: true },
  { key: "sprint_60m", label: "Бег 60м", lowerIsBetter: true },
  { key: "agility", label: "Ловкость (время)", lowerIsBetter: true },
  { key: "standing_jump", label: "Прыжок с места", lowerIsBetter: false },
  { key: "long_jump", label: "Прыжок в длину", lowerIsBetter: false },
  { key: "flexibility", label: "Гибкость", lowerIsBetter: false },
  { key: "push_ups", label: "Отжимания", lowerIsBetter: false },
  { key: "pull_ups", label: "Подтягивания", lowerIsBetter: false },
  { key: "plank_sec", label: "Планка", lowerIsBetter: false },
  { key: "balance_test_sec", label: "Баланс", lowerIsBetter: false },
];

export function getDecliningMetrics(
  prev: ApiTestSession | undefined,
  curr: ApiTestSession | undefined,
): { label: string; detail: string }[] {
  if (!prev?.recorded_at || !curr?.recorded_at) return [];
  const rows: { label: string; detail: string }[] = [];
  for (const { key, label, lowerIsBetter } of METRIC_CHECKS) {
    const a = prev[key];
    const b = curr[key];
    if (typeof a !== "number" || typeof b !== "number") continue;
    const worse = lowerIsBetter ? b > a : b < a;
    if (worse) {
      rows.push({ label, detail: `${a} → ${b}` });
    }
  }
  return rows;
}

export function mergeActivityFeed(input: {
  sessions: ApiTestSession[];
  injuries: Injury[];
  gameStats: GameStat[];
}): ActivityFeedItem[] {
  const out: ActivityFeedItem[] = [];
  for (const s of input.sessions) {
    out.push({
      id: `test-${s.id}`,
      at: s.recorded_at,
      title: "Тестирование",
      subtitle: "Физические тесты",
    });
  }
  for (const inj of input.injuries) {
    out.push({
      id: `inj-${inj.id}`,
      at: inj.injuryDate || inj.createdAt,
      title: inj.name,
      subtitle: inj.status === "in_progress" ? "Травма (в процессе)" : "Восстановлено",
    });
  }
  for (const g of input.gameStats) {
    const parts = [g.season, g.competitionName].filter(Boolean).join(" · ");
    out.push({
      id: `game-${g.id}`,
      at: g.recordedAt,
      title: `Статистика: ${g.gamesPlayed} матч.`,
      subtitle: parts || undefined,
    });
  }
  out.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime());
  return out.slice(0, 5);
}

export function historyToProgress(history: HistoryPoint[]) {
  return history.map((h) => ({ month: h.date, rating: h.score }));
}

export function anthroSeries(snapshots: AnthroSnapshot[]) {
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  const weightSeries = sorted
    .filter((s) => s.weight != null)
    .map((s) => ({ date: formatDate(s.recordedAt), value: s.weight as number }));
  const heightSeries = sorted
    .filter((s) => s.height != null)
    .map((s) => ({ date: formatDate(s.recordedAt), value: s.height as number }));
  return { weightSeries, heightSeries };
}

export function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}
