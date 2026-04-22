import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RatingStars } from "@/components/shared/RatingStars";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePlayerVideos } from "@/hooks/useVideos";
import { formatDate } from "@/lib/utils";
import type { Video } from "@/types";
import type { PlayerProfileTabProps } from "./tabProps";
import { VideoEmbed, videoThumbFromUrl } from "./VideoEmbed";
import { AssessmentAddDialog } from "./AssessmentAddDialog";

export function AssessmentsTab({ playerId, isOwner }: PlayerProfileTabProps) {
  const { data: videos = [] } = usePlayerVideos(playerId);
  const [active, setActive] = useState<Video | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const list = useMemo(
    () =>
      videos.filter(
        (v) =>
          v.isAssessment ||
          v.rating != null ||
          (v.comment != null && v.comment.length > 0) ||
          (v.trainingPlan != null && v.trainingPlan.length > 0),
      ),
    [videos],
  );

  return (
    <div className="space-y-4">
      {isOwner && (
        <Button className="bg-primary text-primary-foreground" aria-label="Добавить оценку" onClick={() => setAddOpen(true)}>
          Добавить оценку
        </Button>
      )}

      {list.length === 0 ? (
        <EmptyState icon={Play} title="Нет оценок" description="Добавьте видео с оценкой и планом" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => {
            const thumb = v.thumbnail || videoThumbFromUrl(v.videoUrl);
            return (
              <Card
                key={v.id}
                className="cursor-pointer overflow-hidden border-border bg-card transition-colors hover:border-primary/40"
                tabIndex={0}
                role="button"
                aria-label={`Открыть оценку: ${v.title}`}
                onClick={() => setActive(v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActive(v);
                }}
              >
                <div className="relative">
                  <img src={thumb || ""} alt="" className="h-40 w-full object-cover bg-muted" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
                    <RatingStars value={v.rating ?? 0} size="sm" className="drop-shadow" />
                    <span className="text-xs text-white/90">{v.duration}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                    <Play className="h-10 w-10 text-white" aria-hidden />
                  </div>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{v.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(v.uploadedAt)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={active != null} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-3xl border-border bg-card max-h-[90vh] overflow-y-auto" aria-describedby="as-view-hint">
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
          </DialogHeader>
          {active?.videoUrl ? (
            <>
              <p id="as-view-hint" className="sr-only">Просмотр оценки и материалов</p>
              <VideoEmbed url={active.videoUrl} />
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Рейтинг</span>
                <RatingStars value={active.rating ?? 0} />
              </div>
              {active.comment && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-foreground">Комментарий</p>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{active.comment}</p>
                </div>
              )}
              {active.trainingPlan && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-foreground">План тренировок</p>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{active.trainingPlan}</p>
                </div>
              )}
            </>
          ) : (
            <p id="as-view-hint" className="text-sm text-muted-foreground">Ссылка на видео отсутствует</p>
          )}
        </DialogContent>
      </Dialog>

      <AssessmentAddDialog playerId={playerId} open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
