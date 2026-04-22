import { ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface ConfidenceBadgeProps {
  verified: boolean;
  verifiedBy?: string;
  className?: string;
}

export function ConfidenceBadge({ verified, verifiedBy, className }: ConfidenceBadgeProps) {
  if (verified) {
    return (
      <Tooltip content={verifiedBy ? `Подтверждено: ${verifiedBy}` : "Подтверждено"}>
        <span className={cn("inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success", className)}>
          <ShieldCheck className="h-3 w-3" />
          Подтверждено
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip content="Не проверено экспертом">
      <span className={cn("inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground", className)}>
        <ShieldAlert className="h-3 w-3" />
        Не подтверждено
      </span>
    </Tooltip>
  );
}
