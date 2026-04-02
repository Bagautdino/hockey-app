import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

export const step1Schema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  middleName: z.string().optional(),
  birthDate: z.string().min(1, "Укажите дату рождения"),
  position: z.enum(["forward", "defender", "goalkeeper"], {
    required_error: "Выберите позицию",
  }),
  shootingHand: z.enum(["left", "right"], {
    required_error: "Выберите руку хвата",
  }),
  region: z.string().min(2, "Укажите регион"),
  city: z.string().min(2, "Укажите город"),
  team: z.string().optional(),
  jerseyNumber: z.coerce
    .number()
    .int("Целое число")
    .min(1, "Минимум 1")
    .max(99, "Максимум 99")
    .optional()
    .or(z.literal("")),
});

export const step2Schema = z.object({
  height: z.coerce
    .number()
    .min(100, "Минимум 100 см")
    .max(220, "Максимум 220 см"),
  weight: z.coerce
    .number()
    .min(15, "Минимум 15 кг")
    .max(150, "Максимум 150 кг"),
  armSpan: z.coerce
    .number()
    .min(80, "Минимум 80 см")
    .max(240, "Максимум 240 см"),
  legLength: z.coerce
    .number()
    .min(40, "Минимум 40 см")
    .max(130, "Максимум 130 см"),
  torsoLength: z.coerce
    .number()
    .min(30, "Минимум 30 см")
    .max(100, "Максимум 100 см"),
  sittingHeight: z.coerce
    .number()
    .min(50, "Минимум 50 см")
    .max(130, "Максимум 130 см"),
  shoulderWidth: z.coerce
    .number()
    .min(20, "Минимум 20 см")
    .max(60, "Максимум 60 см"),
  shoeSize: z.coerce
    .number()
    .min(25, "Минимум 25")
    .max(50, "Максимум 50"),
  bodyFatPct: z.coerce
    .number()
    .min(3, "Минимум 3%")
    .max(40, "Максимум 40%")
    .optional()
    .or(z.literal("")),
});

export const step3Schema = z.object({
  sprint20mFwd: z.coerce
    .number()
    .min(2, "Минимум 2 сек")
    .max(10, "Максимум 10 сек"),
  sprint20mBwd: z.coerce
    .number()
    .min(2, "Минимум 2 сек")
    .max(12, "Максимум 12 сек"),
  sprint60m: z.coerce
    .number()
    .min(5, "Минимум 5 сек")
    .max(20, "Максимум 20 сек")
    .optional()
    .or(z.literal("")),
  standingJump: z.coerce
    .number()
    .min(50, "Минимум 50 см")
    .max(300, "Максимум 300 см"),
  longJump: z.coerce
    .number()
    .min(80, "Минимум 80 см")
    .max(350, "Максимум 350 см")
    .optional()
    .or(z.literal("")),
  agility: z.coerce
    .number()
    .min(4, "Минимум 4 сек")
    .max(20, "Максимум 20 сек"),
  flexibility: z.coerce
    .number()
    .min(-20, "Минимум −20 см")
    .max(40, "Максимум 40 см"),
  pushUps: z.coerce
    .number()
    .int("Целое число")
    .min(0, "Минимум 0")
    .max(100, "Максимум 100")
    .optional()
    .or(z.literal("")),
  pullUps: z.coerce
    .number()
    .int("Целое число")
    .min(0, "Минимум 0")
    .max(50, "Максимум 50")
    .optional()
    .or(z.literal("")),
  plankSec: z.coerce
    .number()
    .min(0, "Минимум 0 сек")
    .max(600, "Максимум 600 сек")
    .optional()
    .or(z.literal("")),
  balanceTestSec: z.coerce
    .number()
    .min(0, "Минимум 0 сек")
    .max(300, "Максимум 300 сек")
    .optional()
    .or(z.literal("")),
});

export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;

export interface FormData {
  step1?: Step1Values;
  step2?: Step2Values;
  step3?: Step3Values;
}

export function useNewPlayerForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});

  const totalSteps = 4;

  function saveStep1(data: Step1Values) {
    setFormData((prev) => ({ ...prev, step1: data }));
    setStep(2);
  }

  function saveStep2(data: Step2Values) {
    setFormData((prev) => ({ ...prev, step2: data }));
    setStep(3);
  }

  function saveStep3(data: Step3Values) {
    setFormData((prev) => ({ ...prev, step3: data }));
    setStep(4);
  }

  async function submitForm() {
    await new Promise((r) => setTimeout(r, 800));
    navigate("/dashboard");
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  return {
    step,
    totalSteps,
    formData,
    saveStep1,
    saveStep2,
    saveStep3,
    submitForm,
    goBack,
  };
}
