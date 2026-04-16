import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ProgressChartProps {
  data: Array<{ month: string; rating: number }>;
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div data-testid="progress-chart">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[50, 100]}
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
            formatter={(value: number) => [`${value}`, "Рейтинг"]}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#dbad7b"
            strokeWidth={2.5}
            dot={{ fill: "#dbad7b", r: 4 }}
            activeDot={{ r: 6, fill: "#dbad7b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
