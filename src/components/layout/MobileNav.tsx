import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, Users, UserPlus, LogOut, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Главная", icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: "/players", label: "Игроки", icon: <Users className="h-5 w-5" /> },
  { to: "/player/new", label: "Добавить игрока", icon: <UserPlus className="h-5 w-5" /> },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="flex items-center justify-between bg-blue-700 px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2">
          <Snowflake className="h-5 w-5" />
          <span className="font-bold text-sm">Хоккейный Родитель</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          className="rounded-lg p-1.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <div className="absolute inset-x-0 top-[52px] z-50 bg-blue-700 px-3 pb-4 shadow-lg md:hidden">
          <nav aria-label="Мобильная навигация">
            <ul className="space-y-1 pt-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition-colors",
                        isActive ? "bg-white/20 text-white" : "hover:bg-white/10 hover:text-white"
                      )
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-blue-100 hover:bg-white/10 hover:text-white"
                  onClick={() => { setOpen(false); navigate("/login"); }}
                  aria-label="Выйти из аккаунта"
                >
                  <LogOut className="h-5 w-5" />
                  Выйти
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
