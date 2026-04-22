import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  puck_retrieval: "bg-blue-500/20 text-blue-400",
  battles: "bg-red-500/20 text-red-400",
  puck_loss: "bg-orange-500/20 text-orange-400",
  puck_pickup: "bg-green-500/20 text-green-400",
  individual_tactics: "bg-purple-500/20 text-purple-400",
  group_tactics: "bg-cyan-500/20 text-cyan-400",
  shot: "bg-yellow-500/20 text-yellow-400",
  faceoffs: "bg-pink-500/20 text-pink-400",
  goal_conceded: "bg-red-500/20 text-red-400",
  save_dangerous: "bg-green-500/20 text-green-400",
  shots_on_target: "bg-blue-500/20 text-blue-400",
};

const categoryLabels: Record<string, string> = {
  puck_retrieval: "Подбор шайбы",
  battles: "Единоборства",
  puck_loss: "Потеря шайбы",
  puck_pickup: "Подхват шайбы",
  individual_tactics: "Индивидуальная тактика",
  group_tactics: "Групповая тактика",
  shot: "Бросок",
  faceoffs: "Вбрасывание",
  goal_conceded: "Пропущенный гол",
  save_dangerous: "Сейв из опасной зоны",
  shots_on_target: "Броски в створ",
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        categoryColors[category] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {categoryLabels[category] ?? category}
    </span>
  );
}

export { categoryLabels };
