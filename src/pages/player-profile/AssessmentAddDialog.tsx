import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RatingStars } from "@/components/shared/RatingStars";
import { useCreateAssessment } from "@/hooks/useVideos";

const schema = z.object({
  title: z.string().min(2, "Минимум 2 символа"),
  video_url: z.string().url("Ссылка на видео"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  training_plan: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export function AssessmentAddDialog({
  playerId,
  open,
  onClose,
}: {
  playerId: string;
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateAssessment(playerId);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 3, title: "", video_url: "", comment: "", training_plan: "" },
  });
  const rating = watch("rating");

  async function onSave(data: Form) {
    await create.mutateAsync({
      title: data.title,
      video_url: data.video_url,
      rating: data.rating,
      comment: data.comment || undefined,
      training_plan: data.training_plan || undefined,
    });
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card max-w-md" aria-describedby="as-add-hint">
        <DialogHeader>
          <DialogTitle>Новая оценка</DialogTitle>
        </DialogHeader>
        <p id="as-add-hint" className="text-sm text-muted-foreground">Ссылка и рейтинг обязательны</p>
        <form onSubmit={handleSubmit(onSave)} className="space-y-3">
          <div>
            <Label>Название</Label>
            <Input aria-label="Название оценки" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Ссылка на видео</Label>
            <Input aria-label="URL видео" {...register("video_url")} />
            {errors.video_url && <p className="text-xs text-destructive">{errors.video_url.message}</p>}
          </div>
          <div>
            <Label>Рейтинг 1–5</Label>
            <RatingStars value={rating} onChange={(n) => setValue("rating", n, { shouldValidate: true })} />
            {errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
          </div>
          <div>
            <Label>Комментарий</Label>
            <Textarea aria-label="Комментарий тренера" {...register("comment")} />
          </div>
          <div>
            <Label>План тренировок</Label>
            <Textarea aria-label="План тренировок" {...register("training_plan")} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" aria-label="Отмена" onClick={onClose}>Отмена</Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={create.isPending} aria-label="Сохранить оценку">
              {create.isPending ? "…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
