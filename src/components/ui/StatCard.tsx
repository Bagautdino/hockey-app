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
    <Card className="border-white/10 bg-white/[0.04]">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-white/40">{title}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          {unit && <span className="text-sm text-white/40">{unit}</span>}
        </div>
        {delta != null && (
          <div
            className={cn(
              "mt-1 flex items-center gap-0.5 text-xs font-medium",
              positive && "text-emerald-400",
              negative && "text-red-400",
              !positive && !negative && "text-white/30"
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
