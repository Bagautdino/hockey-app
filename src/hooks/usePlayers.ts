import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player } from "@/types";
import {
  fetchPlayers,
  fetchPlayer,
  createPlayer,
  createTestSession,
  type CreatePlayerBody,
  type CreateTestSessionBody,
} from "@/api/players";
import playersData from "@/mocks/players.json";

const mockPlayers = playersData as Player[];

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      try {
        const result = await fetchPlayers();
        if (result.length > 0) return result;
      } catch {
        /* fall through to mock */
      }
      return mockPlayers;
    },
    staleTime: 30_000,
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: ["players", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const result = await fetchPlayer(id);
        if (result) return result;
      } catch {
        /* fall through to mock */
      }
      return mockPlayers.find((p) => p.id === id) ?? null;
    },
    enabled: !!id,
    staleTime: 30_000,
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

export function useCreateTestSession(playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTestSessionBody) =>
      createTestSession(playerId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", playerId] });
      queryClient.invalidateQueries({ queryKey: ["rating", playerId] });
    },
  });
}
