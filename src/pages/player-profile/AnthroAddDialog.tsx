import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateAnthroSnapshot } from "@/hooks/useAnthroSnapshots";

const snapshotSchema = z.object({
  height: z.coerce.number().min(100).max(230).optional().or(z.literal("")),
  weight: z.coerce.number().min(20).max(120).optional().or(z.literal("")),
  body_fat_pct: z.coerce.number().min(3).max(50).optional().or(z.literal("")),
});

type SnapshotForm = z.infer<typeof snapshotSchema>;

export function AnthroAddDialog({
  playerId,
  open,
  onClose,
}: {
  playerId: string;
  open: boolean;
  onClose: () => void;
}) {
  const createSnap = useCreateAnthroSnapshot(playerId);
  const { register, handleSubmit, reset } = useForm<SnapshotForm>({
    resolver: zodResolver(snapshotSchema),
  });

  async function onSnap(data: SnapshotForm) {
    await createSnap.mutateAsync({
      height: data.height === "" ? undefined : Number(data.height),
      weight: data.weight === "" ? undefined : Number(data.weight),
      body_fat_pct:
        data.body_fat_pct === "" ? undefined : Number(data.body_fat_pct),
    });
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-border bg-card" aria-describedby="anthro-hint">
        <DialogHeader>
          <DialogTitle>Новый замер</DialogTitle>
        </DialogHeader>
        <p id="anthro-hint" className="text-sm text-muted-foreground">
          Укажите хотя бы одно значение
        </p>
        <form onSubmit={handleSubmit(onSnap)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Рост (см)</Label>
            <Input type="number" aria-label="Рост в сантиметрах" {...register("height")} />
          </div>
          <div className="space-y-1.5">
            <Label>Вес (кг)</Label>
            <Input type="number" aria-label="Вес в килограммах" {...register("weight")} />
          </div>
          <div className="space-y-1.5">
            <Label>Жир (%)</Label>
            <Input type="number" step="0.1" aria-label="Процент жира" {...register("body_fat_pct")} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" aria-label="Отмена" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={createSnap.isPending} aria-label="Сохранить замер">
              {createSnap.isPending ? "…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
