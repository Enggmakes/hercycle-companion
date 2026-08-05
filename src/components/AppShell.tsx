import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CalendarHeart,
  Flower2,
  Gem,
  Heart,
  HeartPulse,
  Moon,
  NotebookPen,
  Settings,
  Smile,
  Sun,
} from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store-context";
import { PinGate } from "./PinGate";

const NAV = [
  { to: "/", label: "Today", icon: Heart },
  { to: "/calendar", label: "Cycle", icon: CalendarHeart },
  { to: "/mood", label: "Mood", icon: Smile },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/health", label: "Health", icon: HeartPulse },
  { to: "/memories", label: "Us", icon: Gem },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data, update, ready } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <PinGate>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pt-5 pb-28 sm:px-6 md:pb-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl gradient-romance">
              <Flower2 className="size-5 text-primary-foreground" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-xl font-semibold">
                HerCycle <span className="text-primary">❤</span>
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Care, remembered.
              </span>
            </span>
          </Link>
          <button
            aria-label="Toggle theme"
            onClick={() =>
              update((d) => ({ ...d, theme: d.theme === "dark" ? "light" : "dark" }))
            }
            className="glass grid size-10 shrink-0 place-items-center transition-transform hover:scale-105"
          >
            {ready && data.theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
        </header>

        <nav className="glass fixed inset-x-3 bottom-3 z-40 flex justify-between gap-1 p-1.5 md:static md:mt-5 md:gap-2 md:p-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors data-[active=true]:text-primary-foreground md:flex-row md:justify-center md:gap-2 md:text-sm"
                data-active={active}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl gradient-romance"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative size-4" />
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-5 flex-1"
        >
          {children}
        </motion.main>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Stored only on this device · Predictions are estimates, not medical advice.
        </footer>
      </div>
    </PinGate>
  );
}