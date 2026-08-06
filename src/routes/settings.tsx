import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Download, LockKeyhole, LogOut, ShieldCheck, Upload, UserPlus } from "lucide-react";
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

const REMINDERS: { id: string; label: string }[] = [
  { id: "before5", label: "5 days before period" },
  { id: "before2", label: "2 days before period" },
  { id: "periodDay", label: "On period day" },
  { id: "ovulation", label: "Ovulation day" },
  { id: "fertile", label: "Fertile window begins" },
  { id: "pms", label: "PMS begins" },
];

function SettingsPage() {
  const { data, setData, update, updateProfile, profile, ready } = useStore();
  const { user, signOut } = useAuth();
  const [pin, setPin] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  if (!ready) return null;

  const s = profile.settings;
  const logged = Object.keys(profile.moods ?? {}).length;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hercycle-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData;
      if (parsed.profiles?.length) update(() => parsed);
    } catch {
      /* ignore malformed backups */
    }
  };

  return (
    <div className="space-y-5">
      <section className="glass p-5">
        <h1 className="text-2xl font-semibold">Cycle setup</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="last">Last period start</Label>
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
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cycle">Average cycle length</Label>
            <Input
              id="cycle"
              type="number"
              min={20}
              max={45}
              value={s.cycleLength}
              onChange={(e) =>
                updateProfile((p) => ({
                  ...p,
                  settings: {
                    ...p.settings,
                    cycleLength: Math.min(45, Math.max(20, Number(e.target.value) || 28)),
                  },
                }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="period">Period length</Label>
            <Input
              id="period"
              type="number"
              min={1}
              max={10}
              value={s.periodLength}
              onChange={(e) =>
                updateProfile((p) => ({
                  ...p,
                  settings: {
                    ...p.settings,
                    periodLength: Math.min(10, Math.max(1, Number(e.target.value) || 5)),
                  },
                }))
              }
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Currently day {cycleDay(s, new Date())} of {s.cycleLength} ·{" "}
          {differenceInCalendarDays(
            new Date(),
            new Date(`${s.lastPeriodStart}T00:00:00`),
          )}{" "}
          days since last period start.
        </p>
      </section>

      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Reminders</h2>
        <div className="mt-3 space-y-3">
          {REMINDERS.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3">
              <Label htmlFor={r.id} className="text-sm font-normal">
                {r.label}
              </Label>
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
        <p className="mt-3 text-xs text-muted-foreground">
          Reminders appear on the Today screen — nothing is ever sent off this device.
        </p>
      </section>

      <section className="glass p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="size-4 text-primary" /> Privacy
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your data is synchronized in real-time across your devices using the cloud.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            inputMode="numeric"
            maxLength={8}
            placeholder={data.pin ? "New PIN" : "Set a PIN"}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (pin.length >= 4) {
                  update((d) => ({ ...d, pin }));
                  setPin("");
                }
              }}
            >
              <LockKeyhole className="size-4" /> Save PIN
            </Button>
            {data.pin && (
              <Button variant="outline" onClick={() => update((d) => ({ ...d, pin: null }))}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Profiles</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => update((d) => ({ ...d, activeId: p.id }))}
              data-active={p.id === data.activeId}
              className="rounded-full border border-border px-3 py-1.5 text-sm data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground"
            >
              {p.name}
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              update((d) => {
                const np = makeProfile(`Profile ${d.profiles.length + 1}`);
                return { ...d, profiles: [...d.profiles, np], activeId: np.id };
              })
            }
          >
            <UserPlus className="size-4" /> New
          </Button>
        </div>
        <div className="mt-4 grid gap-1.5">
          <Label htmlFor="name">Name for this profile</Label>
          <Input
            id="name"
            value={profile.name}
            maxLength={40}
            onChange={(e) => updateProfile((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Statistics &amp; backup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {logged} moods logged · {Object.keys(profile.notes ?? {}).length} notes ·{" "}
          {(profile.memories ?? []).length} memories
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="size-4" /> Export backup
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Restore
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

      <section className="glass p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <LogOut className="size-4 text-primary" /> Account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <strong>{user?.displayName ?? user?.email}</strong>
        </p>
        {user?.email && user.displayName && (
          <p className="text-xs text-muted-foreground">{user.email}</p>
        )}
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => void signOut()}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}