import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ShieldCheck, Video, Trophy, ArrowRight } from "lucide-react";

const features = [
  {
    icon: <TrendingUp className="h-7 w-7 text-[#dbad7b]" />,
    title: "Объективная оценка",
    desc: "Научно обоснованная система показателей для оценки навыков хоккеиста.",
  },
  {
    icon: <Video className="h-7 w-7 text-[#dbad7b]" />,
    title: "Видеоанализ",
    desc: "Загружайте видео тренировок для детального разбора техники.",
  },
  {
    icon: <ShieldCheck className="h-7 w-7 text-[#dbad7b]" />,
    title: "Надёжная платформа",
    desc: "Все данные защищены и доступны только вам и авторизованным скаутам.",
  },
  {
    icon: <Trophy className="h-7 w-7 text-[#dbad7b]" />,
    title: "Путь к профессионалам",
    desc: "Помогаем юным хоккеистам попасть в поле зрения лучших клубов России.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-wide text-white" style={{ fontFamily: "'Poiret One', sans-serif" }}>
              Хоккейный Родитель
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => navigate("/login")}
            >
              Войти
            </Button>
            <Button
              className="bg-[#dbad7b] text-black hover:bg-[#c89a68] border border-[#dbad7b]"
              onClick={() => navigate("/player/new")}
            >
              Зарегистрировать игрока
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-black px-4 py-20 text-white md:px-8 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#dbad7b]/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=1200')] bg-cover bg-center opacity-[0.07]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full border border-[#dbad7b]/30 bg-[#dbad7b]/10 px-4 py-1.5 text-sm font-medium text-[#dbad7b]">
            Платформа для юных хоккеистов
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Раскрой потенциал<br />
            <span className="text-[#dbad7b]">твоего чемпиона</span>
          </h1>
          <p className="mb-10 text-lg text-white/60 md:text-xl">
            Объективная оценка навыков, отслеживание прогресса и прямой путь
            к профессиональному хоккею. Для родителей, игроков и скаутов.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68] border border-[#dbad7b]"
              onClick={() => navigate("/player/new")}
              aria-label="Зарегистрировать игрока"
            >
              Зарегистрировать игрока
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 hover:border-white/40"
              onClick={() => navigate("/players")}
            >
              Смотреть игроков
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Проблема объективной оценки
            </h2>
            <p className="mx-auto max-w-2xl text-white/50">
              Многие талантливые игроки остаются незамеченными из-за отсутствия
              единой системы оценки. Мы решаем эту проблему.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-white/10 bg-white/[0.03] transition-all hover:border-[#dbad7b]/30 hover:bg-white/[0.06]"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#dbad7b]/10">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-white/50">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-white/[0.02] px-4 py-16 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Готов начать?
          </h2>
          <p className="mb-8 text-white/50">
            Зарегистрируй своего игрока бесплатно и получи первый отчёт уже сегодня.
          </p>
          <Button
            size="lg"
            className="bg-[#dbad7b] text-black font-semibold hover:bg-[#c89a68] border border-[#dbad7b]"
            onClick={() => navigate("/player/new")}
          >
            Зарегистрировать игрока
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-sm text-white/30 md:px-8">
        © 2024 Хоккейный Родитель. Все права защищены.
      </footer>
    </div>
  );
}
