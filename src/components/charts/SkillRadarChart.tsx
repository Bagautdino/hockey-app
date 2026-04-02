import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const SKILL_LABELS: Record<string, string> = {
  skating: "Катание",
  shooting: "Броски",
  passing: "Пас",
  physical: "Физподготовка",
  vision: "Тактика",
  defense: "Дисциплина",
};

export interface SkillRadarChartProps {
  skills: Record<string, number>;
}

export function SkillRadarChart({ skills }: SkillRadarChartProps) {
  const data = Object.entries(skills).map(([key, value]) => ({
    skill: SKILL_LABELS[key] ?? key,
    value,
  }));

  return (
    <div data-testid="skill-radar-chart">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
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
    </div>
  );
}
