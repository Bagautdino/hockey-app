import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateGameStat } from "@/hooks/useGameStats";

const statSchema = z.object({
  season: z.string().min(1, "Укажите сезон"),
  competition_name: z.string().optional(),
  games_played: z.coerce.number().int().min(0),
  goals: z.coerce.number().optional(),
  assists: z.coerce.number().optional(),
  points: z.coerce.number().optional(),
  plus_minus: z.coerce.number().optional(),
  penalty_minutes: z.coerce.number().optional(),
  goals_against_avg: z.coerce.number().optional(),
  save_pct: z.coerce.number().optional(),
  shutouts: z.coerce.number().optional(),
});

type StatForm = z.infer<typeof statSchema>;

export function GameStatAddDialog({
  playerId,
  isGk,
  open,
  onClose,
}: {
  playerId: string;
  isGk: boolean;
  open: boolean;
  onClose: () => void;
}) {
  const createStat = useCreateGameStat(playerId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatForm>({
    resolver: zodResolver(statSchema),
    defaultValues: { games_played: 0, season: "" },
  });

  async function onAdd(data: StatForm) {
    const body: Record<string, unknown> = {
      season: data.season,
      competition_name: data.competition_name || undefined,
      games_played: data.games_played,
      recorded_at: new Date().toISOString().slice(0, 10),
    };
    if (isGk) {
      if (data.goals_against_avg != null) body.goals_against_avg = data.goals_against_avg;
      if (data.save_pct != null) body.save_pct = data.save_pct;
      if (data.shutouts != null) body.shutouts = data.shutouts;
    } else {
      if (data.goals != null) body.goals = data.goals;
      if (data.assists != null) body.assists = data.assists;
      if (data.points != null) body.points = data.points;
      if (data.plus_minus != null) body.plus_minus = data.plus_minus;
      if (data.penalty_minutes != null) body.penalty_minutes = data.penalty_minutes;
    }
    await createStat.mutateAsync(body);
    reset({ games_played: 0, season: data.season });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card max-w-md" aria-describedby="stat-hint">
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
        </DialogHeader>
        <p id="stat-hint" className="text-sm text-muted-foreground">Заполните сезон и игры</p>
        <form onSubmit={handleSubmit(onAdd)} className="space-y-2">
          <div>
            <Label>Сезон</Label>
            <Input aria-label="Сезон" {...register("season")} />
            {errors.season && <p className="text-xs text-destructive">{errors.season.message}</p>}
          </div>
          <div>
            <Label>Турнир (необяз.)</Label>
            <Input aria-label="Название турнира" {...register("competition_name")} />
          </div>
          <div>
            <Label>Игры</Label>
            <Input type="number" aria-label="Сыграно игр" {...register("games_played")} />
          </div>
          {isGk ? (
            <>
              <div><Label>СПГ</Label><Input type="number" step="0.01" aria-label="Средние пропущенные голы" {...register("goals_against_avg")} /></div>
              <div><Label>ОТ (0–1)</Label><Input type="number" step="0.001" aria-label="Процент сейвов" {...register("save_pct")} /></div>
              <div><Label>Сухие</Label><Input type="number" aria-label="Сухие матчи" {...register("shutouts")} /></div>
            </>
          ) : (
            <>
              <div><Label>Голы</Label><Input type="number" aria-label="Голы" {...register("goals")} /></div>
              <div><Label>Передачи</Label><Input type="number" aria-label="Передачи" {...register("assists")} /></div>
              <div><Label>Очки</Label><Input type="number" aria-label="Очки" {...register("points")} /></div>
              <div><Label>+/−</Label><Input type="number" aria-label="Плюс минус" {...register("plus_minus")} /></div>
              <div><Label>Штрафные минуты</Label><Input type="number" aria-label="Штрафные минуты" {...register("penalty_minutes")} /></div>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" aria-label="Отмена" onClick={onClose}>Отмена</Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={createStat.isPending} aria-label="Сохранить статистику">
              {createStat.isPending ? "…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
