import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePlayers } from "@/hooks/usePlayers";
import { getAge, positionLabel, ratingBadgeVariant } from "@/lib/utils";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Position } from "@/types";

const REGIONS = [
  "Все регионы",
  "Москва",
  "Санкт-Петербург",
  "Татарстан",
  "Свердловская область",
  "Новосибирская область",
  "Башкортостан",
  "Омская область",
  "Челябинская область",
  "Красноярский край",
];

const POSITIONS: { value: string; label: string }[] = [
  { value: "all", label: "Все позиции" },
  { value: "forward", label: "Нападающий" },
  { value: "defender", label: "Защитник" },
  { value: "goalkeeper", label: "Вратарь" },
];

export function PlayersPage() {
  const navigate = useNavigate();
  const { data: players = [] } = usePlayers();

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("Все регионы");
  const [position, setPosition] = useState("all");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase());
      const matchesRegion = region === "Все регионы" || p.region === region;
      const matchesPosition = position === "all" || p.position === (position as Position);
      return matchesSearch && matchesRegion && matchesPosition;
    });
  }, [players, search, region, position]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Игроки</h1>
          <p className="text-sm text-white/40">{filtered.length} из {players.length} игроков</p>
        </div>
        <Button
          onClick={() => navigate("/player/new")}
          aria-label="Добавить нового игрока"
          className="hidden sm:flex bg-[#dbad7b] text-black hover:bg-[#c89a68]"
        >
          Добавить игрока
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Поиск по имени..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Поиск игрока по имени"
          />
        </div>

        <div className="flex gap-2">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[160px]" aria-label="Фильтр по региону">
              <SlidersHorizontal className="mr-2 h-4 w-4 flex-shrink-0" />
              <SelectValue placeholder="Регион" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="w-[160px]" aria-label="Фильтр по позиции">
              <SelectValue placeholder="Позиция" />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-white/30">
          <Search className="mb-3 h-10 w-10 opacity-30" />
          <p>Игроки не найдены</p>
          <p className="text-sm">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((player) => (
            <Card
              key={player.id}
              className="cursor-pointer border-white/10 bg-white/[0.04] transition-all hover:border-[#dbad7b]/30 hover:bg-white/[0.06]"
              onClick={() => navigate(`/player/${player.id}`)}
              tabIndex={0}
              role="button"
              aria-label={`Открыть профиль ${player.firstName} ${player.lastName}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/player/${player.id}`);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={player.avatar}
                      alt={`${player.firstName} ${player.lastName}`}
                    />
                    <AvatarFallback className="bg-[#dbad7b]/20 text-[#dbad7b] font-semibold">
                      {player.firstName[0]}{player.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-white truncate">
                        {player.firstName} {player.lastName}
                      </p>
                      <Badge variant={ratingBadgeVariant(player.rating)}>
                        {player.rating}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      {positionLabel(player.position)} · {getAge(player.birthDate)} лет
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">{player.region}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="sm:hidden">
        <Button
          className="w-full bg-[#dbad7b] text-black hover:bg-[#c89a68]"
          onClick={() => navigate("/player/new")}
          aria-label="Добавить нового игрока"
        >
          Добавить игрока
        </Button>
      </div>
    </div>
  );
}
