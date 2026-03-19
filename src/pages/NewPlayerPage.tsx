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
import { Check, ArrowLeft } from "lucide-react";
import { useState } from "react";

const STEPS = ["Личные данные", "Антропометрия", "Физические тесты", "Подтверждение"];

function StepIndicator({ current, total }: { current: number; total: number }) {
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
                    ? "bg-blue-700 text-white"
                    : active
                    ? "border-2 border-blue-700 text-blue-700"
                    : "border-2 border-gray-200 text-gray-400"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  active ? "font-medium text-blue-700" : "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 transition-colors",
                  done ? "bg-blue-700" : "bg-gray-200"
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
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Step1Form({ onNext }: { onNext: (d: Step1Values) => void }) {
  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<Step1Values>({ resolver: zodResolver(step1Schema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Имя" error={errors.firstName?.message}>
          <Input placeholder="Алексей" aria-label="Имя игрока" {...register("firstName")} />
        </FormField>
        <FormField label="Фамилия" error={errors.lastName?.message}>
          <Input placeholder="Морозов" aria-label="Фамилия игрока" {...register("lastName")} />
        </FormField>
      </div>
      <FormField label="Дата рождения" error={errors.birthDate?.message}>
        <Input type="date" aria-label="Дата рождения" {...register("birthDate")} />
      </FormField>
      <FormField label="Позиция" error={errors.position?.message}>
        <Select onValueChange={(v) => setValue("position", v as Step1Values["position"], { shouldValidate: true })}>
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
      <FormField label="Регион" error={errors.region?.message}>
        <Input placeholder="Москва" aria-label="Регион" {...register("region")} />
      </FormField>
      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800">
        Далее
      </Button>
    </form>
  );
}

function Step2Form({ onNext, onBack }: { onNext: (d: Step2Values) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<Step2Values>({ resolver: zodResolver(step2Schema) });

  const fields: { name: keyof Step2Values; label: string; placeholder: string }[] = [
    { name: "height", label: "Рост (см)", placeholder: "152" },
    { name: "weight", label: "Вес (кг)", placeholder: "44" },
    { name: "armSpan", label: "Размах рук (см)", placeholder: "158" },
    { name: "legLength", label: "Длина ноги (см)", placeholder: "82" },
  ];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <FormField key={f.name} label={f.label} error={errors[f.name]?.message}>
            <Input type="number" placeholder={f.placeholder} aria-label={f.label} {...register(f.name)} />
          </FormField>
        ))}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Button type="submit" className="flex-1 bg-blue-700 hover:bg-blue-800">Далее</Button>
      </div>
    </form>
  );
}

function Step3Form({ onNext, onBack }: { onNext: (d: Step3Values) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<Step3Values>({ resolver: zodResolver(step3Schema) });

  const fields: { name: keyof Step3Values; label: string; placeholder: string }[] = [
    { name: "sprint20mFwd", label: "Бег 20м вперёд (сек)", placeholder: "3.42" },
    { name: "sprint20mBwd", label: "Бег 20м назад (сек)", placeholder: "4.15" },
    { name: "standingJump", label: "Прыжок с места (см)", placeholder: "178" },
    { name: "agility", label: "Ловкость (сек)", placeholder: "8.2" },
    { name: "flexibility", label: "Гибкость (см)", placeholder: "12" },
  ];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <FormField key={f.name} label={f.label} error={errors[f.name]?.message}>
            <Input type="number" step="0.01" placeholder={f.placeholder} aria-label={f.label} {...register(f.name)} />
          </FormField>
        ))}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Button type="submit" className="flex-1 bg-blue-700 hover:bg-blue-800">Далее</Button>
      </div>
    </form>
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

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Фото игрока (необязательно)</Label>
        <div className="flex items-center gap-4">
          {photo && (
            <img src={photo} alt="Фото игрока" className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-100" />
          )}
          <label
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
            aria-label="Загрузить фото"
          >
            {photo ? "Изменить фото" : "Загрузить фото"}
            <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
          </label>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-4 space-y-1 text-sm">
        <p className="font-semibold text-gray-700 mb-2">Проверьте данные:</p>
        {formData.step1 && (
          <>
            <p><span className="text-gray-500">Имя:</span> {formData.step1.firstName} {formData.step1.lastName}</p>
            <p><span className="text-gray-500">Дата рождения:</span> {formData.step1.birthDate}</p>
            <p><span className="text-gray-500">Регион:</span> {formData.step1.region}</p>
          </>
        )}
        {formData.step2 && (
          <>
            <p><span className="text-gray-500">Рост / Вес:</span> {formData.step2.height} см / {formData.step2.weight} кг</p>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Button
          className="flex-1 bg-blue-700 hover:bg-blue-800"
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
  const { step, totalSteps, formData, saveStep1, saveStep2, saveStep3, submitForm, goBack } =
    useNewPlayerForm();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Новый игрок</h1>
        <p className="text-sm text-gray-500">Шаг {step} из {totalSteps}</p>
      </div>

      <StepIndicator current={step} total={totalSteps} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{STEPS[step - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && <Step1Form onNext={saveStep1} />}
          {step === 2 && <Step2Form onNext={saveStep2} onBack={goBack} />}
          {step === 3 && <Step3Form onNext={saveStep3} onBack={goBack} />}
          {step === 4 && (
            <Step4Confirm formData={formData} onSubmit={submitForm} onBack={goBack} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
