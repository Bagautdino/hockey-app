import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useGameStats } from "@/hooks/useGameStats";
import { formatDate } from "@/lib/utils";
import type { PlayerProfileTabProps } from "./tabProps";
import { GameStatAddDialog } from "./GameStatAddDialog";

type Row = Record<string, unknown> & { id: string };

export function GameStatsTab({ playerId, player, isOwner }: PlayerProfileTabProps) {
  const { data: stats = [] } = useGameStats(playerId);
  const isGk = player.position === "goalkeeper";
  const seasons = useMemo(
    () => [...new Set(stats.map((s) => s.season))].sort(),
    [stats],
  );
  const [season, setSeason] = useState("__all__");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => stats.filter((s) => season === "__all__" || s.season === season),
    [stats, season],
  );

  const fieldColumns: Column<Row>[] = [
    { key: "competitionName", header: "Турнир", render: (r) => (r.competitionName as string) ?? "—" },
    { key: "gamesPlayed", header: "И", sortable: true },
    { key: "goals", header: "Г" },
    { key: "assists", header: "П" },
    { key: "points", header: "О" },
    { key: "plusMinus", header: "+/−" },
    { key: "penaltyMinutes", header: "Штр" },
    { key: "recordedAt", header: "Дата", render: (r) => formatDate(r.recordedAt as string) },
  ];

  const gkColumns: Column<Row>[] = [
    { key: "competitionName", header: "Турнир", render: (r) => (r.competitionName as string) ?? "—" },
    { key: "gamesPlayed", header: "И", sortable: true },
    { key: "goalsAgainstAvg", header: "СПГ", render: (r) => (r.goalsAgainstAvg as number | undefined)?.toFixed(2) ?? "—" },
    { key: "savePct", header: "ОТ%", render: (r) => (r.savePct as number | undefined) != null ? `${Math.round((r.savePct as number) * 100)}%` : "—" },
    { key: "shutouts", header: "Сух" },
    { key: "recordedAt", header: "Дата", render: (r) => formatDate(r.recordedAt as string) },
  ];

  const rows: Row[] = filtered.map((s) => ({
    id: s.id,
    competitionName: s.competitionName,
    gamesPlayed: s.gamesPlayed,
    goals: s.goals ?? "—",
    assists: s.assists ?? "—",
    points: s.points ?? "—",
    plusMinus: s.plusMinus ?? "—",
    penaltyMinutes: s.penaltyMinutes ?? "—",
    goalsAgainstAvg: s.goalsAgainstAvg,
    savePct: s.savePct,
    shutouts: s.shutouts ?? "—",
    recordedAt: s.recordedAt,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[200px]">
          <Label htmlFor="season-sel" className="sr-only">Сезон</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger id="season-sel" aria-label="Выбор сезона">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Все сезоны</SelectItem>
              {seasons.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isOwner && (
          <Button className="bg-primary text-primary-foreground" aria-label="Добавить статистику" onClick={() => setOpen(true)}>
            Добавить
          </Button>
        )}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">
            {isGk ? "Статистика вратаря" : "Статистика полевого"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={isGk ? gkColumns : fieldColumns} data={rows} keyField="id" emptyMessage="Нет данных за сезон" />
        </CardContent>
      </Card>

      <GameStatAddDialog playerId={playerId} isGk={isGk} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
