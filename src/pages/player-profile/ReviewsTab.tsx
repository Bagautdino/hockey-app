import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReviews, useCreateReview } from "@/hooks/useReviews";
import { useCurrentUser, useIsAuthenticated } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/types";
import type { PlayerProfileTabProps } from "./tabProps";

const schema = z.object({ content: z.string().min(3, "Минимум 3 символа") });

type Form = z.infer<typeof schema>;

const roleRu: Record<Review["authorRole"], string> = {
  coach: "Тренер",
  expert: "Эксперт",
  parent: "Родитель",
};

function roleForUser(role: string | undefined): Review["authorRole"] {
  if (role === "parent") return "parent";
  return "expert";
}

export function ReviewsTab({ playerId }: PlayerProfileTabProps) {
  const { data: reviews = [] } = useReviews(playerId);
  const create = useCreateReview(playerId);
  const user = useCurrentUser();
  const authed = useIsAuthenticated();
  const sorted = useMemo(
    () => [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews],
  );
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSend(data: Form) {
    if (!user) return;
    await create.mutateAsync({
      content: data.content,
      author_role: roleForUser(user.role),
    });
    reset();
  }

  return (
    <div className="space-y-6">
      {authed && user && (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSend)} className="space-y-2">
              <Textarea aria-label="Текст отзыва" placeholder="Напишите отзыв…" {...register("content")} />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={create.isPending} aria-label="Отправить отзыв">
                {create.isPending ? "…" : "Отправить"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Пока нет отзывов" description="Станьте первым автором" />
      ) : (
        <ul className="space-y-3">
          {sorted.map((r) => (
            <li key={r.id}>
              <Card className="border-border bg-card">
                <CardContent className="flex gap-3 p-4">
                  <Avatar className="h-10 w-10 shrink-0" aria-hidden>
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {roleRu[r.authorRole]?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" aria-label={`Роль: ${roleRu[r.authorRole]}`}>{roleRu[r.authorRole]}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{r.content}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
