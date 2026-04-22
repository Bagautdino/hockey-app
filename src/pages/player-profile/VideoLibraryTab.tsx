import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CategoryBadge, categoryLabels } from "@/components/shared/CategoryBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useVideoClips, useCreateVideoClip } from "@/hooks/useVideoClips";
import { useIsAuthenticated, useCurrentUser } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import type { PlayerProfileTabProps } from "./tabProps";
import { videoThumbFromUrl } from "./VideoEmbed";

const FIELD_CATS = [
  "puck_retrieval",
  "battles",
  "puck_loss",
  "puck_pickup",
  "individual_tactics",
  "group_tactics",
  "shot",
  "faceoffs",
] as const;
const GK_CATS = ["goal_conceded", "save_dangerous", "shots_on_target"] as const;

const clipSchema = z.object({
  title: z.string().min(1, "Название"),
  video_url: z.string().url("URL"),
  category: z.string().min(1),
  notes: z.string().optional(),
});

type ClipForm = z.infer<typeof clipSchema>;

export function VideoLibraryTab({ playerId, player }: PlayerProfileTabProps) {
  const isGk = player.position === "goalkeeper";
  const cats = isGk ? GK_CATS : FIELD_CATS;
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { data: clips = [], isLoading } = useVideoClips(playerId, filter);
  const create = useCreateVideoClip(playerId);
  const authed = useIsAuthenticated();
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const posType = isGk ? "goalkeeper" : "field";

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ClipForm>({
    resolver: zodResolver(clipSchema),
    defaultValues: { category: cats[0], title: "", video_url: "", notes: "" },
  });
  const catVal = watch("category");

  async function onAdd(data: ClipForm) {
    await create.mutateAsync({
      title: data.title,
      video_url: data.video_url,
      category: data.category,
      position_type: posType,
      notes: data.notes,
    });
    reset({ category: cats[0], title: "", video_url: "", notes: "" });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={filter == null ? "default" : "outline"} className={filter == null ? "bg-primary text-primary-foreground" : ""} aria-label="Все категории" onClick={() => setFilter(undefined)}>
          Все
        </Button>
        {cats.map((c) => (
          <Button key={c} type="button" size="sm" variant={filter === c ? "default" : "outline"} className={filter === c ? "bg-primary text-primary-foreground" : ""} aria-label={`Фильтр: ${categoryLabels[c] ?? c}`} onClick={() => setFilter(c)}>
            {categoryLabels[c] ?? c}
          </Button>
        ))}
      </div>

      {authed && user && (
        <Button className="bg-primary text-primary-foreground" aria-label="Добавить клип" onClick={() => setOpen(true)}>
          Добавить клип
        </Button>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Загрузка…</p>
      ) : clips.length === 0 ? (
        <EmptyState icon={Play} title="Нет клипов" description="Добавьте разбор по категории" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map((c) => {
            const thumb = videoThumbFromUrl(c.videoUrl);
            return (
              <Card key={c.id} className="overflow-hidden border-border bg-card">
                <div className="relative">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-muted">
                      <Play className="h-10 w-10 text-muted-foreground" aria-hidden />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2 p-3">
                  <CategoryBadge category={c.category} />
                  <p className="font-medium text-foreground line-clamp-2">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.uploadedAt)}</p>
                  {c.videoUrl && (
                    <Button variant="outline" size="sm" className="w-full" aria-label={`Смотреть ${c.title}`} onClick={() => window.open(c.videoUrl, "_blank", "noopener,noreferrer")}>
                      Открыть видео
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="border-border bg-card max-w-md" aria-describedby="clip-hint">
          <DialogHeader>
            <DialogTitle>Новый клип</DialogTitle>
          </DialogHeader>
          <p id="clip-hint" className="text-sm text-muted-foreground">Категория и ссылка</p>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-2">
            <div>
              <Label>Название</Label>
              <Input aria-label="Название клипа" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div>
              <Label>Категория</Label>
              <Select value={catVal} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger aria-label="Категория клипа">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c} value={c}>{categoryLabels[c] ?? c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ссылка на видео</Label>
              <Input aria-label="URL видео" {...register("video_url")} />
              {errors.video_url && <p className="text-xs text-destructive">{errors.video_url.message}</p>}
            </div>
            <div>
              <Label>Заметки</Label>
              <Textarea aria-label="Заметки к клипу" {...register("notes")} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" aria-label="Отмена" onClick={() => setOpen(false)}>Отмена</Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={create.isPending} aria-label="Сохранить клип">
                {create.isPending ? "…" : "Сохранить"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
