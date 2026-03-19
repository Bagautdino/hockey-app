import { useQuery } from "@tanstack/react-query";
import type { Player } from "@/types";
import playersData from "@/mocks/players.json";

const players = playersData as Player[];

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: () => players,
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: ["players", id],
    queryFn: () => players.find((p) => p.id === id) ?? null,
    enabled: !!id,
  });
}
