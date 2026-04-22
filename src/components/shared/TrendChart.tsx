import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { cn } from "@/lib/utils";

interface TrendPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  label: string;
  unit?: string;
  color?: string;
  className?: string;
  height?: number;
}

export function TrendChart({
  data,
  label,
  unit = "",
  color = "hsl(var(--primary))",
  className,
  height = 200,
}: TrendChartProps) {
  if (data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center text-sm text-muted-foreground", className)} style={{ height }}>
        Недостаточно данных для графика
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} tickLine={false} axisLine={false} width={40} />
          <RTooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
              color: "#fff",
            }}
            formatter={(val: number) => [`${val}${unit ? ` ${unit}` : ""}`, label]}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
