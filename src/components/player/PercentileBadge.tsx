import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PercentileBadgeProps {
  value: number;
  ageNorm: { p25: number; p75: number };
}

export function PercentileBadge({ value, ageNorm }: PercentileBadgeProps) {
  const isHigh = value > ageNorm.p75;
  const isLow = value < ageNorm.p25;

  const label = isHigh ? "Выше нормы" : isLow ? "Ниже нормы" : "Норма";

  return (
    <Badge
      data-testid="percentile-badge"
      className={cn(
        "text-xs font-medium",
        isHigh && "bg-green-100 text-green-700 hover:bg-green-100",
        isLow && "bg-red-100 text-red-700 hover:bg-red-100",
        !isHigh && !isLow && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
      )}
    >
      {label}
    </Badge>
  );
}
