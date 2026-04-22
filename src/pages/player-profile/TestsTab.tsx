import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { TrendChart } from "@/components/shared/TrendChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTestSessions } from "@/hooks/usePlayers";
import { formatDate } from "@/lib/utils";
import type { ApiTestSession } from "@/api/players";
import type { PlayerProfileTabProps } from "./tabProps";
import { TestsAddDialog } from "./TestsAddDialog";

const METRIC_LIST = [
  { key: "sprint_20m_fwd", label: "Бег 20м вперёд", unit: "сек" },
  { key: "sprint_20m_bwd", label: "Бег 20м назад", unit: "сек" },
  { key: "sprint_60m", label: "Бег 60м", unit: "сек" },
  { key: "standing_jump", label: "Прыжок с места", unit: "см" },
  { key: "long_jump", label: "Тройной прыжок", unit: "см" },
  { key: "agility", label: "Ловкость", unit: "сек" },
  { key: "flexibility", label: "Гибкость", unit: "см" },
  { key: "push_ups", label: "Отжимания", unit: "раз" },
  { key: "pull_ups", label: "Подтягивания", unit: "раз" },
  { key: "plank_sec", label: "Планка", unit: "сек" },
  { key: "balance_test_sec", label: "Равновесие", unit: "сек" },
] as const;

type Row = Record<string, unknown> & { id: string };

export function TestsTab({ playerId, isOwner }: PlayerProfileTabProps) {
  const { data: sessions = [] } = useTestSessions(playerId);
  const [mode, setMode] = useState<"on_ice" | "off_ice">("off_ice");
  const [metric, setMetric] = useState<string>(METRIC_LIST[0].key);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => sessions.filter((s) => (s.category ?? "off_ice") === mode),
    [sessions, mode],
  );

  const rows: Row[] = useMemo(
    () =>
      filtered.map((s) => ({
        id: s.id,
        date: formatDate(s.recorded_at),
        category:
          (s.category ?? "off_ice") === "on_ice"
            ? "На льду (спец.)"
            : "Общая подготовка",
        testName: s.test_name ?? "—",
      })),
    [filtered],
  );

  const columns: Column<Row>[] = [
    { key: "date", header: "Дата", sortable: true },
    { key: "category", header: "Категория" },
    { key: "testName", header: "Название" },
  ];

  const chartData = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
    );
    return sorted
      .map((s) => {
        const v = s[metric as keyof ApiTestSession];
        if (typeof v !== "number") return null;
        return {
          date: new Date(s.recorded_at).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
          }),
          value: v,
        };
      })
      .filter((p): p is { date: string; value: number } => p != null);
  }, [filtered, metric]);

  const sel = METRIC_LIST.find((m) => m.key === metric) ?? METRIC_LIST[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "on_ice" ? "default" : "outline"}
          className={mode === "on_ice" ? "bg-primary text-primary-foreground" : ""}
          aria-label="Показать тесты на льду"
          onClick={() => setMode("on_ice")}
        >
          На льду (спец.)
        </Button>
        <Button
          type="button"
          variant={mode === "off_ice" ? "default" : "outline"}
          className={mode === "off_ice" ? "bg-primary text-primary-foreground" : ""}
          aria-label="Показать общую подготовку"
          onClick={() => setMode("off_ice")}
        >
          Общая подготовка
        </Button>
        {isOwner && (
          <Button className="bg-primary text-primary-foreground ml-auto" aria-label="Добавить тест-сессию" onClick={() => setOpen(true)}>
            Добавить сессию
          </Button>
        )}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Сессии</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={rows} keyField="id" emptyMessage="Нет сессий в этой категории" />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Тренд показателя</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-w-xs">
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="metric-select">
              Метрика
            </label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger id="metric-select" aria-label="Выбор метрики для графика">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_LIST.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TrendChart data={chartData} label={sel.label} unit={sel.unit} height={180} />
        </CardContent>
      </Card>

      <TestsAddDialog playerId={playerId} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
