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
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
          />
          <Radar
            name="Навыки"
            dataKey="value"
            stroke="#dbad7b"
            fill="#dbad7b"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
            formatter={(v: number) => [`${v}`, "Балл"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
