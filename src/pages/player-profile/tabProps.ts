import type { Player, PlayerRating } from "@/types";

export type PlayerProfileTabProps = {
  playerId: string;
  player: Player;
  rating: PlayerRating;
  isOwner: boolean;
};
