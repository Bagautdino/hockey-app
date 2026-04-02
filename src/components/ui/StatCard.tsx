import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
}

export function StatCard({ title, value, unit, delta, deltaLabel }: StatCardProps) {
  const positive = delta != null && delta > 0;
  const negative = delta != null && delta < 0;

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        {delta != null && (
          <div
            className={cn(
              "mt-1 flex items-center gap-0.5 text-xs font-medium",
              positive && "text-green-600",
              negative && "text-red-500",
              !positive && !negative && "text-gray-400"
            )}
            data-testid="stat-delta"
          >
            {positive && <ArrowUp className="h-3 w-3" aria-label="рост" />}
            {negative && <ArrowDown className="h-3 w-3" aria-label="снижение" />}
            <span>
              {positive && "+"}
              {delta}
              {deltaLabel ? ` ${deltaLabel}` : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
