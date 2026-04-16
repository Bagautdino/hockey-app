import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useNewPlayerForm,
  step1Schema,
  step2Schema,
  step3Schema,
  type Step1Values,
  type Step2Values,
  type Step3Values,
} from "@/hooks/useNewPlayerForm";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft, Info } from "lucide-react";
import { useState } from "react";

const STEPS = [
  "Личные данные",
  "Антропометрия",
  "Физические тесты",
  "Подтверждение",
];

function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center justify-between" aria-label="Шаги формы">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  done
                    ? "bg-[#dbad7b] text-black"
                    : active
                    ? "border-2 border-[#dbad7b] text-[#dbad7b]"
                    : "border-2 border-white/15 text-white/30"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  active ? "font-medium text-[#dbad7b]" : "text-white/30"
                )}
              >
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 transition-colors",
                  done ? "bg-[#dbad7b]" : "bg-white/10"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FormField({
  label,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-white/70">
        {label}
        {optional && (
          <span className="text-xs font-normal text-white/25">
            (необязат.)
          </span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p className="flex items-center gap-1 text-xs text-white/25">
          <Info className="h-3 w-3" />
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/40 border-b border-white/10 pb-1">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function NavigationButtons({
  onBack,
  submitLabel = "Далее",
  showBack = true,
}: {
  onBack?: () => void;
  submitLabel?: string;
  showBack?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {showBack && onBack && (
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-white/15 text-white/60 hover:bg-white/5 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
      )}
      <Button
        type="submit"
        className={cn(
          "bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68]",
          showBack ? "flex-1" : "w-full"
        )}
      >
        {submitLabel}
      </Button>
    </div>
  );
}

function Step1Form({ onNext }: { onNext: (d: Step1Values) => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step1Values>({ resolver: zodResolver(step1Schema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <FieldGroup title="Имя игрока">
        <FormField label="Фамилия" error={errors.lastName?.message}>
          <Input
            placeholder="Морозов"
            aria-label="Фамилия игрока"
            {...register("lastName")}
          />
        </FormField>
        <FormField label="Имя" error={errors.firstName?.message}>
          <Input
            placeholder="Алексей"
            aria-label="Имя игрока"
            {...register("firstName")}
          />
        </FormField>
        <FormField
          label="Отчество"
          error={errors.middleName?.message}
          optional
        >
          <Input
            placeholder="Игоревич"
            aria-label="Отчество игрока"
            {...register("middleName")}
          />
        </FormField>
        <FormField label="Дата рождения" error={errors.birthDate?.message}>
          <Input
            type="date"
            aria-label="Дата рождения"
            {...register("birthDate")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Игровые данные">
        <FormField label="Позиция" error={errors.position?.message}>
          <Select
            onValueChange={(v) =>
              setValue("position", v as Step1Values["position"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger aria-label="Позиция на льду">
              <SelectValue placeholder="Выберите позицию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="forward">Нападающий</SelectItem>
              <SelectItem value="defender">Защитник</SelectItem>
              <SelectItem value="goalkeeper">Вратарь</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("position")} />
        </FormField>
        <FormField label="Хват" error={errors.shootingHand?.message}>
          <Select
            onValueChange={(v) =>
              setValue("shootingHand", v as Step1Values["shootingHand"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger aria-label="Рука хвата">
              <SelectValue placeholder="Выберите хват" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Левый</SelectItem>
              <SelectItem value="right">Правый</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("shootingHand")} />
        </FormField>
        <FormField label="Команда" error={errors.team?.message} optional>
          <Input
            placeholder="ЦСКА Юниоры"
            aria-label="Название команды"
            {...register("team")}
          />
        </FormField>
        <FormField
          label="Игровой номер"
          error={errors.jerseyNumber?.message}
          optional
        >
          <Input
            type="number"
            placeholder="17"
            aria-label="Номер на форме"
            {...register("jerseyNumber")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Местоположение">
        <FormField label="Регион" error={errors.region?.message}>
          <Input
            placeholder="Московская область"
            aria-label="Регион"
            {...register("region")}
          />
        </FormField>
        <FormField label="Город" error={errors.city?.message}>
          <Input
            placeholder="Москва"
            aria-label="Город"
            {...register("city")}
          />
        </FormField>
      </FieldGroup>

      <NavigationButtons showBack={false} />
    </form>
  );
}

function Step2Form({
  onNext,
  onBack,
}: {
  onNext: (d: Step2Values) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Values>({ resolver: zodResolver(step2Schema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <FieldGroup title="Основные параметры">
        <FormField
          label="Рост (см)"
          error={errors.height?.message}
          hint="Измерять без обуви, стоя у стены"
        >
          <Input
            type="number"
            placeholder="152"
            aria-label="Рост в сантиметрах"
            {...register("height")}
          />
        </FormField>
        <FormField
          label="Вес (кг)"
          error={errors.weight?.message}
          hint="Утром натощак"
        >
          <Input
            type="number"
            step="0.1"
            placeholder="44"
            aria-label="Вес в килограммах"
            {...register("weight")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Верхняя часть тела">
        <FormField
          label="Размах рук (см)"
          error={errors.armSpan?.message}
          hint="От кончика среднего пальца до кончика другой руки"
        >
          <Input
            type="number"
            placeholder="158"
            aria-label="Размах рук"
            {...register("armSpan")}
          />
        </FormField>
        <FormField
          label="Ширина плеч (см)"
          error={errors.shoulderWidth?.message}
          hint="Биакромиальный размер"
        >
          <Input
            type="number"
            placeholder="34"
            aria-label="Ширина плеч"
            {...register("shoulderWidth")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Нижняя часть тела">
        <FormField
          label="Длина ноги (см)"
          error={errors.legLength?.message}
          hint="От большого вертела до пола"
        >
          <Input
            type="number"
            placeholder="82"
            aria-label="Длина ноги"
            {...register("legLength")}
          />
        </FormField>
        <FormField
          label="Длина туловища (см)"
          error={errors.torsoLength?.message}
          hint="Рост минус длина ноги"
        >
          <Input
            type="number"
            placeholder="70"
            aria-label="Длина туловища"
            {...register("torsoLength")}
          />
        </FormField>
        <FormField
          label="Высота сидя (см)"
          error={errors.sittingHeight?.message}
          hint="Сидя на твёрдой поверхности"
        >
          <Input
            type="number"
            placeholder="78"
            aria-label="Высота в сидячем положении"
            {...register("sittingHeight")}
          />
        </FormField>
        <FormField label="Размер обуви (RU)" error={errors.shoeSize?.message}>
          <Input
            type="number"
            step="0.5"
            placeholder="37"
            aria-label="Размер обуви"
            {...register("shoeSize")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Состав тела">
        <FormField
          label="Процент жира (%)"
          error={errors.bodyFatPct?.message}
          hint="Измерение калипером или биоимпедансом"
          optional
        >
          <Input
            type="number"
            step="0.1"
            placeholder="14.5"
            aria-label="Процент жировой ткани"
            {...register("bodyFatPct")}
          />
        </FormField>
      </FieldGroup>

      <NavigationButtons onBack={onBack} />
    </form>
  );
}

function Step3Form({
  onNext,
  onBack,
}: {
  onNext: (d: Step3Values) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Values>({ resolver: zodResolver(step3Schema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <FieldGroup title="Скоростные качества">
        <FormField
          label="Бег 20м вперёд (сек)"
          error={errors.sprint20mFwd?.message}
          hint="Старт с места, ручной хронометраж"
        >
          <Input
            type="number"
            step="0.01"
            placeholder="3.42"
            aria-label="Бег 20 метров лицом вперёд"
            {...register("sprint20mFwd")}
          />
        </FormField>
        <FormField
          label="Бег 20м назад (сек)"
          error={errors.sprint20mBwd?.message}
        >
          <Input
            type="number"
            step="0.01"
            placeholder="4.15"
            aria-label="Бег 20 метров спиной вперёд"
            {...register("sprint20mBwd")}
          />
        </FormField>
        <FormField
          label="Бег 60м (сек)"
          error={errors.sprint60m?.message}
          optional
        >
          <Input
            type="number"
            step="0.01"
            placeholder="9.8"
            aria-label="Бег 60 метров"
            {...register("sprint60m")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Взрывная сила">
        <FormField
          label="Прыжок в длину с места (см)"
          error={errors.standingJump?.message}
        >
          <Input
            type="number"
            placeholder="178"
            aria-label="Прыжок в длину с места"
            {...register("standingJump")}
          />
        </FormField>
        <FormField
          label="Тройной прыжок (см)"
          error={errors.longJump?.message}
          optional
        >
          <Input
            type="number"
            placeholder="540"
            aria-label="Тройной прыжок с места"
            {...register("longJump")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Координация и гибкость">
        <FormField
          label="Челночный бег / Ловкость (сек)"
          error={errors.agility?.message}
          hint="4×9м или аналогичный тест"
        >
          <Input
            type="number"
            step="0.01"
            placeholder="8.2"
            aria-label="Тест на ловкость"
            {...register("agility")}
          />
        </FormField>
        <FormField
          label="Наклон вперёд / Гибкость (см)"
          error={errors.flexibility?.message}
          hint="Значение может быть отрицательным"
        >
          <Input
            type="number"
            step="0.5"
            placeholder="12"
            aria-label="Тест на гибкость"
            {...register("flexibility")}
          />
        </FormField>
        <FormField
          label="Равновесие (сек)"
          error={errors.balanceTestSec?.message}
          hint="Стойка на одной ноге с закрытыми глазами"
          optional
        >
          <Input
            type="number"
            step="0.1"
            placeholder="30"
            aria-label="Тест на равновесие"
            {...register("balanceTestSec")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Силовая выносливость">
        <FormField
          label="Отжимания (раз)"
          error={errors.pushUps?.message}
          optional
        >
          <Input
            type="number"
            placeholder="25"
            aria-label="Количество отжиманий"
            {...register("pushUps")}
          />
        </FormField>
        <FormField
          label="Подтягивания (раз)"
          error={errors.pullUps?.message}
          optional
        >
          <Input
            type="number"
            placeholder="8"
            aria-label="Количество подтягиваний"
            {...register("pullUps")}
          />
        </FormField>
        <FormField
          label="Планка (сек)"
          error={errors.plankSec?.message}
          hint="Время удержания в секундах"
          optional
        >
          <Input
            type="number"
            placeholder="90"
            aria-label="Время удержания планки"
            {...register("plankSec")}
          />
        </FormField>
      </FieldGroup>

      <NavigationButtons onBack={onBack} />
    </form>
  );
}

const POSITION_LABELS: Record<string, string> = {
  forward: "Нападающий",
  defender: "Защитник",
  goalkeeper: "Вратарь",
};

const HAND_LABELS: Record<string, string> = {
  left: "Левый",
  right: "Правый",
};

function ConfirmRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-white/40">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function Step4Confirm({
  formData,
  onSubmit,
  onBack,
}: {
  formData: ReturnType<typeof useNewPlayerForm>["formData"];
  onSubmit: () => Promise<void>;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    await onSubmit();
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(url);
  }

  const { step1, step2, step3 } = formData;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-white/70">Фото игрока (необязательно)</Label>
        <div className="flex items-center gap-4">
          {photo && (
            <img
              src={photo}
              alt="Фото игрока"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-[#dbad7b]/30"
            />
          )}
          <label
            className="cursor-pointer rounded-lg border-2 border-dashed border-white/15 px-4 py-3 text-sm text-white/40 transition-colors hover:border-[#dbad7b]/40 hover:text-[#dbad7b]"
            aria-label="Загрузить фото"
            tabIndex={0}
          >
            {photo ? "Изменить фото" : "Загрузить фото"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhoto}
            />
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-white/[0.03] border border-white/10 p-4 text-sm">
        <p className="font-semibold text-white/60">Проверьте данные:</p>

        {step1 && (
          <div className="space-y-0.5">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#dbad7b]/60">
              Личные данные
            </h4>
            <ConfirmRow
              label="Имя"
              value={[step1.lastName, step1.firstName, step1.middleName]
                .filter(Boolean)
                .join(" ")}
            />
            <ConfirmRow label="Дата рождения" value={step1.birthDate} />
            <ConfirmRow
              label="Позиция"
              value={POSITION_LABELS[step1.position]}
            />
            <ConfirmRow
              label="Хват"
              value={HAND_LABELS[step1.shootingHand]}
            />
            <ConfirmRow
              label="Местоположение"
              value={`${step1.city}, ${step1.region}`}
            />
            {step1.team && <ConfirmRow label="Команда" value={step1.team} />}
            {step1.jerseyNumber && (
              <ConfirmRow
                label="Номер"
                value={String(step1.jerseyNumber)}
              />
            )}
          </div>
        )}

        {step2 && (
          <div className="space-y-0.5">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#dbad7b]/60">
              Антропометрия
            </h4>
            <ConfirmRow label="Рост" value={`${step2.height} см`} />
            <ConfirmRow label="Вес" value={`${step2.weight} кг`} />
            <ConfirmRow label="Размах рук" value={`${step2.armSpan} см`} />
            <ConfirmRow
              label="Ширина плеч"
              value={`${step2.shoulderWidth} см`}
            />
            <ConfirmRow label="Длина ноги" value={`${step2.legLength} см`} />
            <ConfirmRow
              label="Длина туловища"
              value={`${step2.torsoLength} см`}
            />
            <ConfirmRow
              label="Высота сидя"
              value={`${step2.sittingHeight} см`}
            />
            <ConfirmRow label="Размер обуви" value={`${step2.shoeSize}`} />
            {step2.bodyFatPct && (
              <ConfirmRow
                label="Процент жира"
                value={`${step2.bodyFatPct}%`}
              />
            )}
          </div>
        )}

        {step3 && (
          <div className="space-y-0.5">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#dbad7b]/60">
              Физические тесты
            </h4>
            <ConfirmRow
              label="Бег 20м вперёд"
              value={`${step3.sprint20mFwd} сек`}
            />
            <ConfirmRow
              label="Бег 20м назад"
              value={`${step3.sprint20mBwd} сек`}
            />
            {step3.sprint60m && (
              <ConfirmRow
                label="Бег 60м"
                value={`${step3.sprint60m} сек`}
              />
            )}
            <ConfirmRow
              label="Прыжок с места"
              value={`${step3.standingJump} см`}
            />
            {step3.longJump && (
              <ConfirmRow
                label="Тройной прыжок"
                value={`${step3.longJump} см`}
              />
            )}
            <ConfirmRow label="Ловкость" value={`${step3.agility} сек`} />
            <ConfirmRow
              label="Гибкость"
              value={`${step3.flexibility} см`}
            />
            {step3.pushUps && (
              <ConfirmRow label="Отжимания" value={`${step3.pushUps}`} />
            )}
            {step3.pullUps && (
              <ConfirmRow label="Подтягивания" value={`${step3.pullUps}`} />
            )}
            {step3.plankSec && (
              <ConfirmRow label="Планка" value={`${step3.plankSec} сек`} />
            )}
            {step3.balanceTestSec && (
              <ConfirmRow
                label="Равновесие"
                value={`${step3.balanceTestSec} сек`}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-white/15 text-white/60 hover:bg-white/5 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Button
          className="flex-1 bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68]"
          onClick={handleConfirm}
          disabled={loading}
          aria-label="Создать профиль игрока"
        >
          {loading ? "Создание..." : "Создать профиль"}
        </Button>
      </div>
    </div>
  );
}

export function NewPlayerPage() {
  const {
    step,
    totalSteps,
    formData,
    saveStep1,
    saveStep2,
    saveStep3,
    submitForm,
    goBack,
  } = useNewPlayerForm();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Новый игрок</h1>
        <p className="text-sm text-white/40">
          Шаг {step} из {totalSteps}
        </p>
      </div>

      <StepIndicator current={step} total={totalSteps} />

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader>
          <CardTitle className="text-base text-white">{STEPS[step - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && <Step1Form onNext={saveStep1} />}
          {step === 2 && <Step2Form onNext={saveStep2} onBack={goBack} />}
          {step === 3 && <Step3Form onNext={saveStep3} onBack={goBack} />}
          {step === 4 && (
            <Step4Confirm
              formData={formData}
              onSubmit={submitForm}
              onBack={goBack}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
