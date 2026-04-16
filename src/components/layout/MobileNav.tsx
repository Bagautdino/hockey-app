import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, Users, UserPlus, LogOut } from "lucide-react";
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
      <header className="flex items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[#dbad7b]" style={{ fontFamily: "'Poiret One', sans-serif" }}>
            Хоккейный Родитель
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          className="rounded-lg p-1.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#dbad7b]/50"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <div className="absolute inset-x-0 top-[52px] z-50 border-b border-white/10 bg-[#0a0a0a] px-3 pb-4 shadow-lg md:hidden">
          <nav aria-label="Мобильная навигация">
            <ul className="space-y-1 pt-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#dbad7b]/15 text-[#dbad7b]"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
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
                  className="w-full justify-start gap-3 text-white/50 hover:bg-white/5 hover:text-white"
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
