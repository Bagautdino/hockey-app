import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateInjury } from "@/hooks/useInjuries";

const schema = z.object({
  name: z.string().min(1, "Название"),
  injury_date: z.string().min(1, "Дата"),
  description: z.string().optional(),
  recovery_days: z.coerce.number().optional(),
});

type Form = z.infer<typeof schema>;

export function InjuryAddDialog({
  playerId,
  open,
  onClose,
}: {
  playerId: string;
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateInjury(playerId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { injury_date: new Date().toISOString().slice(0, 10) },
  });

  async function onSave(data: Form) {
    await create.mutateAsync({
      name: data.name,
      injury_date: data.injury_date,
      description: data.description,
      recovery_days: data.recovery_days,
      status: "in_progress",
    });
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-border bg-card" aria-describedby="inj-add-hint">
        <DialogHeader>
          <DialogTitle>Новая травма</DialogTitle>
        </DialogHeader>
        <p id="inj-add-hint" className="text-sm text-muted-foreground">Укажите диагноз и дату</p>
        <form onSubmit={handleSubmit(onSave)} className="space-y-2">
          <div>
            <Label>Название</Label>
            <Input aria-label="Название травмы" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Дата</Label>
            <Input type="date" aria-label="Дата травмы" {...register("injury_date")} />
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea aria-label="Описание травмы" {...register("description")} />
          </div>
          <div>
            <Label>Дней до восст. (необяз.)</Label>
            <Input type="number" aria-label="Дней восстановления" {...register("recovery_days")} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" aria-label="Отмена" onClick={onClose}>Отмена</Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={create.isPending} aria-label="Сохранить травму">
              {create.isPending ? "…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
