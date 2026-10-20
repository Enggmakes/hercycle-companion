import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import {
  Bell,
  Check,
  Download,
  KeyRound,
  LockKeyhole,
  LogOut,
  Minus,
  Plus,
  Settings as SettingsIcon,
  ShieldCheck,
  Sliders,
  Upload,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { makeProfile, type AppData } from "@/lib/store";
import { cycleDay } from "@/lib/cycle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Cycle Setup & Privacy — HerCycle ❤️" },
      {
        name: "description",
        content:
          "Set cycle length, period length and last period date, manage reminders, PIN lock, profiles and backups.",
      },
      { property: "og:title", content: "Cycle Setup & Privacy — HerCycle ❤️" },
      {
        property: "og:description",
        content: "Cycle settings, reminders, PIN lock, profiles and local backup or restore.",
      },
    ],
  }),
  component: SettingsPage,
});

const REMINDERS: { id: string; label: string; desc: string }[] = [
  { id: "before5", label: "5 days before period", desc: "Heads up to stock her comfort essentials" },
  { id: "before2", label: "2 days before period", desc: "Plan a quiet, relaxing evening" },
  { id: "periodDay", label: "On period day", desc: "Extra warmth, tea, and patience" },
  { id: "ovulation", label: "Ovulation day", desc: "Peak fertility and emotional window" },
  { id: "fertile", label: "Fertile window begins", desc: "Follicular phase transition" },
  { id: "pms", label: "PMS begins (~5 days prior)", desc: "Gentle hugs and lower pressure" },
];

function NumberStepper({
  value,
  min,
  max,
  unit = "days",
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card/60 p-1.5">
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-card border border-border/70 text-foreground transition-all press-spring hover:bg-primary hover:text-primary-foreground disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>
      <div className="flex-1 text-center font-display text-lg font-semibold text-foreground">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-card border border-border/70 text-foreground transition-all press-spring hover:bg-primary hover:text-primary-foreground disabled:opacity-30"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function SettingsPage() {
  const { data, update, updateProfile, profile, ready } = useStore();
  const { user, signOut, localMode } = useAuth();
  const [pin, setPin] = useState("");
  const [pinNotice, setPinNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ready) return null;

  const s = profile.settings;
  const loggedMoodsCount = Object.keys(profile.moods ?? {}).length;
  const loggedNotesCount = Object.keys(profile.notes ?? {}).length;
  const loggedMemoriesCount = (profile.memories ?? []).length;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hercycle-backup-${profile.name || "data"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData;
      if (parsed.profiles?.length) {
        update(() => parsed);
      }
    } catch {
      /* ignore malformed backups */
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="glass p-6 animate-enter">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SettingsIcon className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Settings & Privacy
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Configure cycle parameters, PIN security, reminders, and data backups.
            </p>
          </div>
        </div>
      </section>

      {/* Cycle Parameters Setup */}
      <section className="glass p-6 animate-enter [animation-delay:80ms]">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Cycle Setup
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Tune the calculations to match her body&apos;s natural rhythm.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="last" className="text-xs font-semibold text-foreground">
              Last Period Start Date
            </Label>
            <Input
              id="last"
              type="date"
              value={s.lastPeriodStart}
              onChange={(e) =>
                updateProfile((p) => ({
                  ...p,
                  settings: { ...p.settings, lastPeriodStart: e.target.value },
                }))
              }
              className="rounded-2xl border border-border/80 bg-card/60 px-3 py-2 text-xs font-medium"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cycle" className="text-xs font-semibold text-foreground">
              Average Cycle Length
            </Label>
            <NumberStepper
              value={s.cycleLength}
              min={20}
              max={45}
              unit="days"
              onChange={(val) =>
                updateProfile((p) => ({
                  ...p,
                  settings: { ...p.settings, cycleLength: val },
                }))
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="period" className="text-xs font-semibold text-foreground">
              Period Duration
            </Label>
            <NumberStepper
              value={s.periodLength}
              min={1}
              max={10}
              unit="days"
              onChange={(val) =>
                updateProfile((p) => ({
                  ...p,
                  settings: { ...p.settings, periodLength: val },
                }))
              }
            />
          </div>
        </div>

        {/* Live Status Calculation */}
        <div className="mt-4 rounded-xl border border-border/70 bg-card/50 p-3.5 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            Currently on <strong className="text-foreground">Day {cycleDay(s, new Date())}</strong> of {s.cycleLength}
          </span>
          <span>
            {differenceInCalendarDays(
              new Date(),
              new Date(`${s.lastPeriodStart}T00:00:00`),
            )}{" "}
            days since last period start
          </span>
        </div>
      </section>

      {/* Gentle Reminders Configuration */}
      <section className="glass p-6 animate-enter [animation-delay:140ms]">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Care Reminders
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose which heads-up notifications appear on the Today dashboard.
        </p>

        <div className="mt-4 divide-y divide-border/60">
          {REMINDERS.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <Label htmlFor={r.id} className="text-xs font-semibold text-foreground block">
                  {r.label}
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {r.desc}
                </span>
              </div>
              <Switch
                id={r.id}
                checked={profile.reminders[r.id] ?? false}
                onCheckedChange={(v) =>
                  updateProfile((p) => ({
                    ...p,
                    reminders: { ...p.reminders, [r.id]: v },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Privacy & PIN Lock */}
      <section className="glass p-6 animate-enter [animation-delay:200ms]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Privacy & PIN Protection
            </h2>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              data.pin
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {data.pin ? "PIN Active" : "No PIN Set"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Lock HerCycle with a private 4-8 digit numeric passcode whenever the app opens.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={8}
            placeholder={data.pin ? "Change PIN (4-8 digits)" : "Enter 4-8 digit PIN"}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ""));
              setPinNotice("");
            }}
            className="rounded-2xl border border-border/80 bg-card/60 px-4 py-2 text-sm sm:max-w-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (pin.length >= 4) {
                  update((d) => ({ ...d, pin }));
                  setPin("");
                  setPinNotice("PIN saved successfully!");
                }
              }}
              disabled={pin.length < 4}
              className="rounded-2xl gradient-romance text-primary-foreground shadow-sm press-spring"
            >
              <KeyRound className="size-4 mr-1" /> Save PIN
            </Button>
            {data.pin && (
              <Button
                variant="outline"
                onClick={() => {
                  update((d) => ({ ...d, pin: null }));
                  setPinNotice("PIN removed.");
                }}
                className="rounded-2xl border-border press-spring"
              >
                Remove PIN
              </Button>
            )}
          </div>
        </div>
        {pinNotice && (
          <p className="mt-2 text-xs font-semibold text-primary">{pinNotice}</p>
        )}
      </section>

      {/* Multi-Profile Management */}
      <section className="glass p-6 animate-enter [animation-delay:260ms]">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Companion Profiles
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Switch between profiles or create a new dedicated profile.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {data.profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => update((d) => ({ ...d, activeId: p.id }))}
              data-active={p.id === data.activeId}
              className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 press-spring hover:border-primary/50 hover:text-foreground data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground data-[active=true]:border-transparent data-[active=true]:shadow-sm"
            >
              <UserCheck className="size-3.5" />
              <span>{p.name}</span>
            </button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              update((d) => {
                const np = makeProfile(`Profile ${d.profiles.length + 1}`, `p_${Date.now()}`);
                return { ...d, profiles: [...d.profiles, np], activeId: np.id };
              })
            }
            className="rounded-2xl border-dashed border-border hover:border-primary text-xs press-spring"
          >
            <UserPlus className="size-3.5 mr-1" /> New Profile
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-border/70 max-w-sm">
          <Label htmlFor="name" className="text-xs font-semibold text-foreground">
            Current Profile Name
          </Label>
          <Input
            id="name"
            value={profile.name}
            maxLength={40}
            onChange={(e) => updateProfile((p) => ({ ...p, name: e.target.value }))}
            className="mt-1.5 rounded-2xl border border-border/80 bg-card/60 px-3 py-2 text-xs font-medium"
          />
        </div>
      </section>

      {/* Backup, Export & Restore */}
      <section className="glass p-6 animate-enter [animation-delay:320ms]">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Data & Local Backup
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {loggedMoodsCount} moods logged · {loggedNotesCount} journal notes · {loggedMemoriesCount} memories saved.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            onClick={exportData}
            className="rounded-2xl border-border hover:border-primary text-xs press-spring"
          >
            <Download className="size-4 mr-1.5" /> Download JSON Backup
          </Button>
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl border-border hover:border-primary text-xs press-spring"
          >
            <Upload className="size-4 mr-1.5" /> Restore from File
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importData(f);
            }}
          />
        </div>
      </section>

      {/* Account / Offline Storage Details */}
      <section className="glass p-6 animate-enter [animation-delay:380ms]">
        {localMode ? (
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Offline Storage Mode
            </h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              HerCycle is running in pure local offline mode. No account is required and no cycle data is transmitted off your device.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Account Synchronization
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Signed in as <strong className="text-foreground">{user?.displayName ?? user?.email}</strong>
            </p>
            {user?.email && user.displayName && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => void signOut()}
                className="rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-semibold"
              >
                <LogOut className="size-4 mr-1.5" /> Sign out
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}