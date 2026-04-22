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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTestSession } from "@/hooks/usePlayers";
import type { CreateTestSessionBody } from "@/api/players";

const testSessionSchema = z.object({
  category: z.enum(["on_ice", "off_ice"]),
  test_name: z.string().optional(),
  sprint_20m_fwd: z.coerce.number().min(2).max(10).optional().or(z.literal("")),
  sprint_20m_bwd: z.coerce.number().min(2).max(12).optional().or(z.literal("")),
  sprint_60m: z.coerce.number().min(5).max(20).optional().or(z.literal("")),
  standing_jump: z.coerce.number().min(50).max(300).optional().or(z.literal("")),
  long_jump: z.coerce.number().min(80).max(350).optional().or(z.literal("")),
  agility: z.coerce.number().min(4).max(20).optional().or(z.literal("")),
  flexibility: z.coerce.number().min(-20).max(40).optional().or(z.literal("")),
  push_ups: z.coerce.number().int().min(0).max(100).optional().or(z.literal("")),
  pull_ups: z.coerce.number().int().min(0).max(50).optional().or(z.literal("")),
  plank_sec: z.coerce.number().min(0).max(600).optional().or(z.literal("")),
  balance_test_sec: z.coerce.number().min(0).max(300).optional().or(z.literal("")),
});

type TestSessionFormValues = z.infer<typeof testSessionSchema>;

const TEST_FIELDS: Array<{ key: keyof TestSessionFormValues; label: string; unit: string; step?: string }> = [
  { key: "sprint_20m_fwd", label: "Бег 20м вперёд", unit: "сек", step: "0.01" },
  { key: "sprint_20m_bwd", label: "Бег 20м назад", unit: "сек", step: "0.01" },
  { key: "sprint_60m", label: "Бег 60м", unit: "сек", step: "0.01" },
  { key: "standing_jump", label: "Прыжок с места", unit: "см" },
  { key: "long_jump", label: "Тройной прыжок", unit: "см" },
  { key: "agility", label: "Ловкость", unit: "сек", step: "0.01" },
  { key: "flexibility", label: "Гибкость", unit: "см", step: "0.5" },
  { key: "push_ups", label: "Отжимания", unit: "раз" },
  { key: "pull_ups", label: "Подтягивания", unit: "раз" },
  { key: "plank_sec", label: "Планка", unit: "сек" },
  { key: "balance_test_sec", label: "Равновесие", unit: "сек", step: "0.1" },
];

export function TestsAddDialog({
  playerId,
  open,
  onClose,
}: {
  playerId: string;
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useCreateTestSession(playerId);
  const { register, handleSubmit, reset, setValue, watch } = useForm<TestSessionFormValues>({
    resolver: zodResolver(testSessionSchema),
    defaultValues: { category: "off_ice", test_name: "" },
  });
  const category = watch("category");

  async function onSubmit(data: TestSessionFormValues) {
    const metrics: Record<string, number> = {};
    for (const field of TEST_FIELDS) {
      const val = data[field.key];
      if (val !== "" && val != null) metrics[field.key] = Number(val);
    }
    await mutation.mutateAsync({
      category: data.category,
      test_name: data.test_name?.trim() || undefined,
      ...metrics,
    } as CreateTestSessionBody);
    reset({ category: "off_ice", test_name: "" });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card max-w-md" aria-describedby="tests-add-hint">
        <DialogHeader>
          <DialogTitle>Новая тест-сессия</DialogTitle>
        </DialogHeader>
        <p id="tests-add-hint" className="text-sm text-muted-foreground">Категория и показатели — по необходимости</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Категория</Label>
            <Select value={category} onValueChange={(v) => setValue("category", v as "on_ice" | "off_ice")}>
              <SelectTrigger aria-label="Категория теста">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on_ice">На льду (спец. подготовка)</SelectItem>
                <SelectItem value="off_ice">Общая подготовка</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="test-name">Название теста (необязательно)</Label>
            <Input id="test-name" aria-label="Название теста" {...register("test_name")} />
          </div>
          {TEST_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <Label className="w-36 shrink-0 text-xs text-muted-foreground">{f.label}</Label>
              <Input type="number" step={f.step ?? "1"} className="flex-1" aria-label={f.label} {...register(f.key)} />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" aria-label="Отмена" onClick={onClose}>Отмена</Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={mutation.isPending} aria-label="Сохранить тест">
              {mutation.isPending ? "…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
