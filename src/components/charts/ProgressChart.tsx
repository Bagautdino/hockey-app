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
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[50, 100]}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
            formatter={(value: number) => [`${value}`, "Рейтинг"]}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#1d4ed8"
            strokeWidth={2.5}
            dot={{ fill: "#1d4ed8", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
