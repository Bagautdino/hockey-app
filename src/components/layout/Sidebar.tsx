import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  Snowflake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Главная",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    to: "/players",
    label: "Игроки",
    icon: <Users className="h-5 w-5" />,
  },
  {
    to: "/player/new",
    label: "Добавить игрока",
    icon: <UserPlus className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-64 flex-col bg-blue-700 text-white">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
          <Snowflake className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">Хоккейный</p>
          <p className="text-xs text-blue-200">Родитель</p>
        </div>
      </div>

      <Separator className="bg-blue-600" />

      <nav className="flex-1 px-3 py-4" aria-label="Основная навигация">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-4 bg-blue-600" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-blue-100 hover:bg-white/10 hover:text-white"
          onClick={() => navigate("/login")}
          aria-label="Выйти из аккаунта"
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </Button>
      </div>
    </aside>
  );
}
