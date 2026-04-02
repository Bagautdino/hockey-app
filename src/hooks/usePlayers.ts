import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player } from "@/types";
import { fetchPlayers, fetchPlayer, createPlayer, type CreatePlayerBody } from "@/api/players";
import playersData from "@/mocks/players.json";

const mockPlayers = playersData as Player[];

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      try {
        const result = await fetchPlayers();
        return result.length > 0 ? result : mockPlayers;
      } catch {
        return mockPlayers;
      }
    },
    placeholderData: mockPlayers,
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: ["players", id],
    queryFn: async () => {
      if (!id) return mockPlayers[0] ?? null;
      try {
        const result = await fetchPlayer(id);
        return result ?? mockPlayers.find((p) => p.id === id) ?? mockPlayers[0] ?? null;
      } catch {
        return mockPlayers.find((p) => p.id === id) ?? mockPlayers[0] ?? null;
      }
    },
    enabled: !!id,
    placeholderData: mockPlayers.find((p) => p.id === id) ?? mockPlayers[0] ?? null,
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePlayerBody) => createPlayer(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}
