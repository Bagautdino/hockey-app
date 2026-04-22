import type { ComponentType } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/hooks/usePlayers";
import { usePlayerRating } from "@/hooks/useRatings";
import { useCurrentUser } from "@/hooks/useAuth";
import { getAge, positionLabel, ratingBadgeVariant, formatDate } from "@/lib/utils";
import type { PlayerProfileTabProps } from "@/pages/player-profile/tabProps";
import { ProfileTab } from "@/pages/player-profile/ProfileTab";
import { AnthroTab } from "@/pages/player-profile/AnthroTab";
import { TestsTab } from "@/pages/player-profile/TestsTab";
import { GameStatsTab } from "@/pages/player-profile/GameStatsTab";
import { InjuriesTab } from "@/pages/player-profile/InjuriesTab";
import { AssessmentsTab } from "@/pages/player-profile/AssessmentsTab";
import { VideoLibraryTab } from "@/pages/player-profile/VideoLibraryTab";
import { ReviewsTab } from "@/pages/player-profile/ReviewsTab";

const TAB_TRIGGER = [
  ["profile", "Профиль", "Вкладка профиль"],
  ["anthro", "Антропометрия", "Вкладка антропометрия"],
  ["tests", "Тесты", "Вкладка тесты"],
  ["stats", "Статистика", "Вкладка статистика"],
  ["injuries", "Травмы", "Вкладка травмы"],
  ["assessments", "Оценки", "Вкладка оценки"],
  ["videos", "Видеотека", "Вкладка видеотека"],
  ["reviews", "Отзывы", "Вкладка отзывы"],
] as const;

const TAB_CONTENT: [string, ComponentType<PlayerProfileTabProps>][] = [
  ["profile", ProfileTab],
  ["anthro", AnthroTab],
  ["tests", TestsTab],
  ["stats", GameStatsTab],
  ["injuries", InjuriesTab],
  ["assessments", AssessmentsTab],
  ["videos", VideoLibraryTab],
  ["reviews", ReviewsTab],
];

const TAB_ACTIVE = "data-[state=active]:bg-primary/20 data-[state=active]:text-primary";

export function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: player, isLoading: pLoad } = usePlayer(id ?? "");
  const { data: rating, isLoading: rLoad } = usePlayerRating(id ?? "");
  const currentUser = useCurrentUser();
  const isOwner = currentUser?.id === player?.parentId;

  if (!id) {
    return (
      <p className="text-muted-foreground" role="status">
        Не указан игрок
      </p>
    );
  }

  if (pLoad || rLoad) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground" role="status">
        Загрузка профиля…
      </div>
    );
  }

  if (!player) {
    return (
      <p className="text-muted-foreground" role="status">
        Игрок не найден
      </p>
    );
  }

  if (!rating) {
    return (
      <p className="text-muted-foreground" role="status">
        Не удалось загрузить рейтинг
      </p>
    );
  }

  const age = getAge(player.birthDate);
  const tabProps: PlayerProfileTabProps = {
    playerId: id,
    player,
    rating,
    isOwner: !!isOwner,
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="-ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
        aria-label="Вернуться назад"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Назад
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20 ring-2 ring-primary/30">
          <AvatarImage src={player.avatar} alt={`${player.firstName} ${player.lastName}`} />
          <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
            {player.firstName[0]}
            {player.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              {player.firstName} {player.lastName}
            </h1>
            <Badge variant={ratingBadgeVariant(player.rating)} className="text-sm" aria-label={`Рейтинг ${player.rating}`}>
              {player.rating}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {positionLabel(player.position)} · {age} лет
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground/80">{formatDate(player.birthDate)}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 border border-border bg-muted/50 p-1">
          {TAB_TRIGGER.map(([value, label, a11y]) => (
            <TabsTrigger key={value} value={value} className={TAB_ACTIVE} aria-label={a11y}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TAB_CONTENT.map(([value, Cmp]) => (
          <TabsContent key={value} value={value} className="mt-4">
            <Cmp {...tabProps} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
