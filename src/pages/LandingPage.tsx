import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShieldCheck, Video, Trophy, ArrowRight, Snowflake } from "lucide-react";

const features = [
  {
    icon: <TrendingUp className="h-7 w-7 text-blue-600" />,
    title: "Объективная оценка",
    desc: "Научно обоснованная система показателей для оценки навыков хоккеиста.",
  },
  {
    icon: <Video className="h-7 w-7 text-blue-600" />,
    title: "Видеоанализ",
    desc: "Загружайте видео тренировок для детального разбора техники.",
  },
  {
    icon: <ShieldCheck className="h-7 w-7 text-blue-600" />,
    title: "Надёжная платформа",
    desc: "Все данные защищены и доступны только вам и авторизованным скаутам.",
  },
  {
    icon: <Trophy className="h-7 w-7 text-blue-600" />,
    title: "Путь к профессионалам",
    desc: "Помогаем юным хоккеистам попасть в поле зрения лучших клубов России.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-blue-700" />
            <span className="font-bold text-blue-700">Хоккейный Родитель</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Войти
            </Button>
            <Button onClick={() => navigate("/player/new")}>
              Зарегистрировать игрока
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 px-4 py-20 text-white md:px-8 md:py-32">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/hockey/1200/600')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-amber-500 text-white hover:bg-amber-500">
            Платформа для юных хоккеистов
          </Badge>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Раскрой потенциал<br />
            <span className="text-amber-400">твоего чемпиона</span>
          </h1>
          <p className="mb-10 text-lg text-blue-100 md:text-xl">
            Объективная оценка навыков, отслеживание прогресса и прямой путь
            к профессиональному хоккею. Для родителей, игроков и скаутов.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-amber-500 text-white hover:bg-amber-600"
              onClick={() => navigate("/player/new")}
              aria-label="Зарегистрировать игрока"
            >
              Зарегистрировать игрока
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate("/players")}
            >
              Смотреть игроков
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Проблема объективной оценки
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Многие талантливые игроки остаются незамеченными из-за отсутствия
              единой системы оценки. Мы решаем эту проблему.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-gray-100 transition-shadow hover:shadow-md"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-50 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Готов начать?
          </h2>
          <p className="mb-8 text-gray-600">
            Зарегистрируй своего игрока бесплатно и получи первый отчёт уже сегодня.
          </p>
          <Button
            size="lg"
            className="bg-blue-700 hover:bg-blue-800"
            onClick={() => navigate("/player/new")}
          >
            Зарегистрировать игрока
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <footer className="border-t px-4 py-6 text-center text-sm text-gray-500 md:px-8">
        © 2024 Хоккейный Родитель. Все права защищены.
      </footer>
    </div>
  );
}
