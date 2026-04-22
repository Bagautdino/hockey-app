import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function RatingStars({ value, onChange, max = 5, size = "md", className }: RatingStarsProps) {
  const interactive = !!onChange;
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`Рейтинг: ${value} из ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={cn("transition-colors", interactive ? "cursor-pointer hover:text-gold" : "cursor-default")}
            aria-label={`${i + 1} из ${max}`}
            tabIndex={interactive ? 0 : -1}
          >
            <Star className={cn(sizeMap[size], filled ? "fill-gold text-gold" : "fill-none text-muted-foreground/40")} />
          </button>
        );
      })}
    </div>
  );
}
