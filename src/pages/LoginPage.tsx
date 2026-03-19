import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  role: z.enum(["parent", "scout"] as const, {
    required_error: "Выберите роль",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: "parent", label: "Родитель", desc: "Отслеживаю прогресс своего ребёнка" },
  { value: "scout", label: "Скаут", desc: "Ищу перспективных игроков" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (_data: LoginFormValues) => {
    await new Promise((r) => setTimeout(r, 500));
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700">
            <Snowflake className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Хоккейный Родитель</h1>
          <p className="mt-1 text-gray-500">Войдите в свой аккаунт</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Вход</CardTitle>
            <CardDescription>Выберите роль и введите данные для входа</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label>Роль</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setValue("role", r.value, { shouldValidate: true })}
                      aria-label={`Роль: ${r.label}`}
                      className={cn(
                        "rounded-xl border-2 p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                        selectedRole === r.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      )}
                    >
                      <p className="font-medium text-sm text-gray-900">{r.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{r.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ivan@example.com"
                  aria-label="Email адрес"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  aria-label="Пароль"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800"
                disabled={isSubmitting}
                aria-label="Войти в аккаунт"
              >
                {isSubmitting ? "Вход..." : "Войти"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-gray-500">
          Нет аккаунта?{" "}
          <button
            onClick={() => navigate("/player/new")}
            className="text-blue-600 hover:underline focus:outline-none focus:underline"
          >
            Зарегистрировать игрока
          </button>
        </p>
      </div>
    </div>
  );
}
