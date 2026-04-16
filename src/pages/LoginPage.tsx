import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  role: z.enum(["parent", "scout"] as const, {
    required_error: "Выберите роль",
  }),
});

const registerSchema = loginSchema.extend({
  full_name: z.string().min(2, "Введите полное имя"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: "parent", label: "Родитель", desc: "Отслеживаю прогресс своего ребёнка" },
  { value: "scout", label: "Скаут", desc: "Ищу перспективных игроков" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null);
    try {
      if (isRegister) {
        await registerUser({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          role: data.role,
        });
      }
      await login({ email: data.email, password: data.password });
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Ошибка входа. Проверьте данные.";
      setApiError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[#dbad7b]/5 via-transparent to-transparent" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dbad7b]/20 border border-[#dbad7b]/30">
            <span className="text-2xl font-bold text-[#dbad7b]" style={{ fontFamily: "'Poiret One', sans-serif" }}>X</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Хоккейный Родитель</h1>
          <p className="mt-1 text-white/50">
            {isRegister ? "Создайте аккаунт" : "Войдите в свой аккаунт"}
          </p>
        </div>

        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {isRegister ? "Регистрация" : "Вход"}
            </CardTitle>
            <CardDescription className="text-white/40">
              {isRegister
                ? "Заполните данные для создания аккаунта"
                : "Выберите роль и введите данные для входа"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/70">Роль</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setValue("role", r.value, { shouldValidate: true })}
                      aria-label={`Роль: ${r.label}`}
                      className={cn(
                        "rounded-xl border-2 p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#dbad7b]/50",
                        selectedRole === r.value
                          ? "border-[#dbad7b] bg-[#dbad7b]/10"
                          : "border-white/10 hover:border-[#dbad7b]/40 bg-white/[0.02]"
                      )}
                    >
                      <p className="font-medium text-sm text-white">{r.label}</p>
                      <p className="mt-0.5 text-xs text-white/40">{r.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-xs text-red-400">{errors.role.message}</p>
                )}
              </div>

              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-white/70">Полное имя</Label>
                  <Input
                    id="full_name"
                    placeholder="Иван Петров"
                    aria-label="Полное имя"
                    {...register("full_name")}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-400">{errors.full_name.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ivan@example.com"
                  aria-label="Email адрес"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  aria-label="Пароль"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {apiError && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {apiError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68]"
                disabled={isSubmitting}
                aria-label={isRegister ? "Зарегистрироваться" : "Войти в аккаунт"}
              >
                {isSubmitting
                  ? "Загрузка..."
                  : isRegister
                  ? "Зарегистрироваться"
                  : "Войти"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-white/40">
          {isRegister ? (
            <>
              Уже есть аккаунт?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-[#dbad7b] hover:underline focus:outline-none focus:underline"
              >
                Войти
              </button>
            </>
          ) : (
            <>
              Нет аккаунта?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="text-[#dbad7b] hover:underline focus:outline-none focus:underline"
              >
                Зарегистрироваться
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
