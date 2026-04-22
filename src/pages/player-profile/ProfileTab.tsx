import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/shared/FileUpload";
import { usePatchPlayer, useUploadPlayerPhoto } from "@/hooks/usePlayers";
import { getPlayerPhotoUrl } from "@/api/players";
import {
  formatDate,
  getAge,
  positionLabel,
  handLabel,
} from "@/lib/utils";
import type { PlayerProfileTabProps } from "./tabProps";

const profileSchema = z.object({
  email: z.string().email("Некорректный email").or(z.literal("")),
  hockey_start_date: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfileTab({
  playerId,
  player,
  isOwner,
}: PlayerProfileTabProps) {
  const patch = usePatchPlayer(playerId);
  const uploadPhoto = useUploadPlayerPhoto(playerId);
  const [avatarUrl, setAvatarUrl] = useState(player.avatar ?? "");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: player.email ?? "",
      hockey_start_date: player.hockeyStartDate?.slice(0, 10) ?? "",
    },
  });

  useEffect(() => {
    reset({
      email: player.email ?? "",
      hockey_start_date: player.hockeyStartDate?.slice(0, 10) ?? "",
    });
    setAvatarUrl(player.avatar ?? "");
  }, [player, reset]);

  async function onPhoto(file: File) {
    await uploadPhoto.mutateAsync(file);
    try {
      const url = await getPlayerPhotoUrl(playerId);
      setAvatarUrl(url);
    } catch {
      setAvatarUrl(player.avatar ?? "");
    }
  }

  async function onSave(data: ProfileForm) {
    await patch.mutateAsync({
      email: data.email || undefined,
      hockey_start_date: data.hockey_start_date || undefined,
    });
  }

  const age = getAge(player.birthDate);
  const bioFields = [
    { label: "Позиция", value: positionLabel(player.position) },
    { label: "Хват", value: handLabel(player.shootingHand) },
    { label: "Город", value: player.city },
    { label: "Регион", value: player.region },
    ...(player.team ? [{ label: "Команда", value: player.team }] : []),
    ...(player.jerseyNumber != null
      ? [{ label: "Номер", value: `#${player.jerseyNumber}` }]
      : []),
    { label: "Дата рождения", value: formatDate(player.birthDate) },
    { label: "Возраст", value: `${age} лет` },
  ];

  return (
    <div className="space-y-4">
      {isOwner && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Редактирование
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  aria-label="Email игрока"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-hockey-start">
                  Начало занятий хоккеем
                </Label>
                <Input
                  id="profile-hockey-start"
                  type="date"
                  aria-label="Дата начала занятий хоккеем"
                  {...register("hockey_start_date")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Фото</Label>
              <FileUpload
                accept="image/*"
                maxSizeMB={10}
                onFileSelect={onPhoto}
                preview={avatarUrl || null}
                onClear={() => setAvatarUrl(player.avatar ?? "")}
                label="Загрузить фото профиля"
              />
            </div>
            <Button
              type="button"
              className="bg-primary text-primary-foreground"
              disabled={patch.isPending}
              aria-label="Сохранить профиль"
              onClick={handleSubmit(onSave)}
            >
              {patch.isPending ? "Сохранение…" : "Сохранить"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">
            Информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border/50">
            {bioFields.map((field) => (
              <div
                key={field.label}
                className="flex justify-between gap-4 py-2.5"
              >
                <dt className="text-sm text-muted-foreground">{field.label}</dt>
                <dd className="text-right font-semibold text-foreground">
                  {field.value}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="text-right font-semibold text-foreground">
                {player.email ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted-foreground">
                Старт в хоккее
              </dt>
              <dd className="text-right font-semibold text-foreground">
                {player.hockeyStartDate
                  ? formatDate(player.hockeyStartDate)
                  : "—"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
