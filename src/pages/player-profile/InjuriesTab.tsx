import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { useInjuries, useUpdateInjury, useDeleteInjury } from "@/hooks/useInjuries";
import { formatDate } from "@/lib/utils";
import { Activity } from "lucide-react";
import type { Injury } from "@/types";
import type { PlayerProfileTabProps } from "./tabProps";
import { InjuryAddDialog } from "./InjuryAddDialog";

export function InjuriesTab({ playerId, isOwner }: PlayerProfileTabProps) {
  const { data: injuries = [], isLoading } = useInjuries(playerId);
  const update = useUpdateInjury(playerId);
  const del = useDeleteInjury(playerId);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function onStatus(id: string, status: Injury["status"]) {
    await update.mutateAsync({ injuryId: id, body: { status } });
  }

  async function onDelete(id: string) {
    await del.mutateAsync(id);
    setConfirmId(null);
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Загрузка…</p>;
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <Button className="bg-primary text-primary-foreground" aria-label="Добавить травму" onClick={() => setAddOpen(true)}>
          Добавить травму
        </Button>
      )}

      {injuries.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent>
            <EmptyState icon={Activity} title="Нет записей" description="Травмы не добавлены" />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {injuries.map((i) => (
            <li key={i.id}>
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{i.name}</span>
                      <Badge
                        className={
                          i.status === "in_progress"
                            ? "bg-red-600 text-white hover:bg-red-600"
                            : "bg-green-600 text-white hover:bg-green-600"
                        }
                        aria-label={i.status === "in_progress" ? "Статус: в процессе" : "Статус: восстановлен"}
                      >
                        {i.status === "in_progress" ? "В процессе" : "Восстановлен"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(i.injuryDate)}</p>
                    {i.description && <p className="mt-1 text-sm text-foreground/90">{i.description}</p>}
                  </div>
                  {isOwner && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={i.status}
                        onValueChange={(v) => onStatus(i.id, v as Injury["status"])}
                      >
                        <SelectTrigger className="w-[160px]" aria-label={`Статус: ${i.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">В процессе</SelectItem>
                          <SelectItem value="recovered">Восстановлен</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="destructive" size="sm" aria-label={`Удалить ${i.name}`} onClick={() => setConfirmId(i.id)}>
                        Удалить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <InjuryAddDialog playerId={playerId} open={addOpen} onClose={() => setAddOpen(false)} />

      <Dialog open={confirmId != null} onOpenChange={(v) => !v && setConfirmId(null)}>
        <DialogContent className="border-border bg-card" aria-describedby="del-inj-hint">
          <DialogHeader>
            <DialogTitle>Удалить запись?</DialogTitle>
          </DialogHeader>
          <p id="del-inj-hint" className="text-sm text-muted-foreground">Действие необратимо</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" aria-label="Отмена удаления" onClick={() => setConfirmId(null)}>Отмена</Button>
            <Button variant="destructive" aria-label="Подтвердить удаление" onClick={() => confirmId && onDelete(confirmId)}>Удалить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
