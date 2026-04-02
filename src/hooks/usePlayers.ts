import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player } from "@/types";
import { fetchPlayers, fetchPlayer, createPlayer, type CreatePlayerBody } from "@/api/players";
import playersData from "@/mocks/players.json";

const mockPlayers = playersData as Player[];

function useApiMode(): boolean {
  try {
    return !!globalThis.localStorage?.getItem("access_token");
  } catch {
    return false;
  }
}

export function usePlayers() {
  const apiMode = useApiMode();
  return useQuery({
    queryKey: ["players"],
    queryFn: () => fetchPlayers(),
    enabled: apiMode,
    ...(apiMode ? {} : { initialData: mockPlayers }),
  });
}

export function usePlayer(id: string) {
  const apiMode = useApiMode();
  return useQuery({
    queryKey: ["players", id],
    queryFn: () => fetchPlayer(id),
    enabled: apiMode && !!id,
    ...(apiMode ? {} : { initialData: mockPlayers.find((p) => p.id === id) ?? null }),
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
