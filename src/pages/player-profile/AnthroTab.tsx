import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PercentileBadge } from "@/components/player/PercentileBadge";
import { TrendChart } from "@/components/shared/TrendChart";
import { useAnthroSnapshots } from "@/hooks/useAnthroSnapshots";
import { getAge } from "@/lib/utils";
import type { AgeNormFields, AnthroSnapshot } from "@/types";
import ageNormsData from "@/mocks/ageNorms.json";
import type { PlayerProfileTabProps } from "./tabProps";
import { AnthroAddDialog } from "./AnthroAddDialog";

const ageNormsMap = ageNormsData as Record<string, AgeNormFields>;

const ANTHRO_FIELDS: Array<{ key: string; label: string; unit: string }> = [
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

export function AnthroTab({ player, isOwner }: PlayerProfileTabProps) {
  const age = getAge(player.birthDate);
  const norms = ageNormsMap[String(age)];
  const { anthropometrics: anthro } = player;
  const { data: snapshots = [] } = useAnthroSnapshots(player.id, 180);
  const [open, setOpen] = useState(false);

  function series(pick: (s: AnthroSnapshot) => number | undefined) {
    return snapshots
      .filter((s) => pick(s) != null)
      .map((s) => ({
        date: new Date(s.recordedAt).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
        }),
        value: pick(s) ?? 0,
      }));
  }
  const chartBlocks = [
    { data: series((s) => s.height), label: "Рост", unit: "см" },
    { data: series((s) => s.weight), label: "Вес", unit: "кг" },
    { data: series((s) => s.bodyFatPct), label: "Жир, %", unit: "%" },
  ];

  return (
    <div className="space-y-4">
      {isOwner && (
        <Button className="bg-primary text-primary-foreground" aria-label="Добавить замер" onClick={() => setOpen(true)}>
          Добавить замер
        </Button>
      )}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Антропометрия</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Параметр</th>
                <th className="pb-2 font-medium">Значение</th>
                <th className="pb-2 text-right font-medium">Перцентиль</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {ANTHRO_FIELDS.map((field) => {
                const val = anthro[field.key as keyof typeof anthro];
                if (val == null) return null;
                const norm = norms?.[field.key];
                return (
                  <tr key={field.key}>
                    <td className="py-2.5 text-sm text-muted-foreground">{field.label}</td>
                    <td className="py-2.5 font-semibold text-foreground">
                      {val}
                      {field.unit ? ` ${field.unit}` : ""}
                    </td>
                    <td className="py-2.5 text-right">
                      {norm ? <PercentileBadge value={val} ageNorm={norm} /> : <span className="text-xs text-muted-foreground/50">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Динамика за 180 дней</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {chartBlocks.map((c) => (
            <TrendChart key={c.label} data={c.data} label={c.label} unit={c.unit} height={160} />
          ))}
        </CardContent>
      </Card>

      <AnthroAddDialog playerId={player.id} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
