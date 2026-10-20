import { Link, useRouterState } from "@tanstack/react-router";
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
  UserCheck,
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
  const { data, update, ready, profile } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <PinGate>
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pt-4 pb-28 sm:px-6 md:pb-12">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-4 py-2">
          <Link to="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl gradient-romance shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Flower2 className="size-5 text-primary-foreground" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  HerCycle
                </span>
                <span className="text-primary text-base select-none">❤️</span>
              </div>
              <p className="truncate text-xs font-medium text-muted-foreground">
                Care, remembered.
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {ready && profile?.name && (
              <Link
                to="/settings"
                title="Active Profile"
                className="hidden items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex"
              >
                <UserCheck className="size-3.5 text-primary" />
                <span className="truncate max-w-[120px]">For {profile.name}</span>
              </Link>
            )}

            <button
              aria-label="Toggle theme"
              onClick={() =>
                update((d) => ({ ...d, theme: d.theme === "dark" ? "light" : "dark" }))
              }
              className="glass grid size-10 shrink-0 place-items-center rounded-2xl transition-all duration-200 hover:scale-105 hover:border-primary/40"
            >
              {ready && data.theme === "dark" ? (
                <Sun className="size-4 text-amber-300 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="size-4 text-primary transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )}
            </button>
          </div>
        </header>

        {/* Desktop Navigation Floating Bar */}
        <nav className="glass hidden items-center justify-between gap-1 p-1.5 md:flex md:mt-4">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                data-active={active}
                className="press-spring relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm"
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main Content Area — entrance animation */}
        <main className="mt-6 flex-1 animate-enter">
          {children}
        </main>

        {/* Mobile Navigation Dock */}
        <nav className="glass fixed inset-x-4 bottom-3 z-40 flex items-center justify-between gap-1 rounded-3xl p-1.5 shadow-xl md:hidden">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                data-active={active}
                className="press-spring relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground"
              >
                <Icon className="size-4" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Intimate Warm Footer */}
        <footer className="mt-12 text-center text-xs text-muted-foreground animate-fade" style={{ animationDelay: '400ms' }}>
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <Heart className="size-3 text-primary/60" />
            <span>Private & stored only on this device</span>
            <span className="text-border">·</span>
            <span>Predictions are caring estimates, not medical advice</span>
          </p>
        </footer>
      </div>
    </PinGate>
  );
}