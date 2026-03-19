import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

export const step1Schema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  birthDate: z.string().min(1, "Укажите дату рождения"),
  position: z.enum(["forward", "defender", "goalkeeper"], {
    required_error: "Выберите позицию",
  }),
  region: z.string().min(2, "Укажите регион"),
});

export const step2Schema = z.object({
  height: z.coerce.number().min(100, "Минимум 100 см").max(220, "Максимум 220 см"),
  weight: z.coerce.number().min(20, "Минимум 20 кг").max(150, "Максимум 150 кг"),
  armSpan: z.coerce.number().min(100, "Минимум 100 см").max(230, "Максимум 230 см"),
  legLength: z.coerce.number().min(50, "Минимум 50 см").max(130, "Максимум 130 см"),
});

export const step3Schema = z.object({
  sprint20mFwd: z.coerce.number().min(2, "Минимум 2 сек").max(10, "Максимум 10 сек"),
  sprint20mBwd: z.coerce.number().min(2, "Минимум 2 сек").max(12, "Максимум 12 сек"),
  standingJump: z.coerce.number().min(50, "Минимум 50 см").max(300, "Максимум 300 см"),
  agility: z.coerce.number().min(4, "Минимум 4 сек").max(20, "Максимум 20 сек"),
  flexibility: z.coerce.number().min(-20, "Минимум -20 см").max(40, "Максимум 40 см"),
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

  return { step, totalSteps, formData, saveStep1, saveStep2, saveStep3, submitForm, goBack };
}
