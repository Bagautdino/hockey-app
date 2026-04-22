import * as React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  children,
  content,
  className,
}: {
  children: React.ReactNode;
  content: string;
  className?: string;
}) {
  return (
    <span className={cn("relative group/tooltip inline-flex", className)} title={content}>
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-popover text-popover-foreground border border-border shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {content}
      </span>
    </span>
  );
}
