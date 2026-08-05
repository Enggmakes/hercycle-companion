import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { format } from "date-fns";
import { Bell, Droplets, Egg, HeartHandshake, Quote, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store-context";
import {
  cycleDay,
  currentPhase,
  dayKind,
  fertilityStatus,
  upcoming,
  DAY_META,
} from "@/lib/cycle";
import { LOVE_TIPS, QUOTES, pickDaily } from "@/lib/content";
import { MOODS } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HerCycle ❤️ — Care for her cycle, every day" },
      {
        name: "description",
        content:
          "A private, offline cycle companion for partners: countdowns, moods, notes and daily caring reminders.",
      },
      { property: "og:title", content: "HerCycle ❤️ — Care for her cycle, every day" },
      {
        property: "og:description",
        content: "Private cycle countdowns, moods and daily caring reminders for partners.",
      },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  return (
    <motion.div whileHover={{ y: -3 }} className="glass p-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

function Dashboard() {
  const { profile, updateProfile, ready } = useStore();
  if (!ready) return null;

  const today = new Date();
  const key = format(today, "yyyy-MM-dd");
  const s = profile.settings;
  const kind = dayKind(s, today);
  const up = upcoming(s, today);
  const tip = pickDaily(LOVE_TIPS, today);
  const quote = pickDaily(QUOTES, today);
  const mood = profile.moods[key];

  const reminders = [
    { on: up.daysTo(up.nextPeriod) <= 5, text: "Period is close — stock up on her essentials." },
    { on: up.daysTo(up.nextPeriod) <= 2, text: "Two days out — plan a soft, easy evening." },
    { on: kind === "period", text: "Period day — warmth, rest and patience." },
    { on: kind === "ovulation", text: "Ovulation day — energy peaks, be mindful." },
    { on: kind === "fertile", text: "Fertile window has begun." },
    { on: kind === "pms", text: "PMS window — extra gentleness helps." },
  ].filter((r) => r.on);

  return (
    <div className="space-y-5">
      <section className="glass overflow-hidden p-6">
        <p className="text-sm text-muted-foreground">{format(today, "EEEE, d MMMM")}</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Take care of her today ❤️</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {profile.name} is on <strong>day {cycleDay(s, today)}</strong> ·{" "}
          {currentPhase(s, today)}
        </p>
        <span
          className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground"
          style={{ backgroundColor: `var(--${DAY_META[kind].token})` }}
        >
          <Sparkles className="size-3.5" /> {DAY_META[kind].label} · {fertilityStatus(kind)}
        </span>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Next period"
          value={`${up.daysTo(up.nextPeriod)}d`}
          sub={format(up.nextPeriod, "d MMM")}
          accent="var(--phase-period)"
        />
        <Stat
          label="Ovulation"
          value={`${up.daysTo(up.nextOvulation)}d`}
          sub={format(up.nextOvulation, "d MMM")}
          accent="var(--phase-ovulation)"
        />
        <Stat
          label="Fertile window"
          value={`${up.daysTo(up.nextFertile)}d`}
          sub={format(up.nextFertile, "d MMM")}
          accent="var(--phase-fertile)"
        />
        <Stat
          label="PMS begins"
          value={`${up.daysTo(up.nextPms)}d`}
          sub={format(up.nextPms, "d MMM")}
          accent="var(--phase-pms)"
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="glass p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <HeartHandshake className="size-4 text-primary" /> Love reminder
          </h2>
          <p className="mt-2 text-base">{tip}</p>
          <Link
            to="/notes"
            className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Write it down →
          </Link>
        </div>

        <div className="glass p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Droplets className="size-4 text-primary" /> How is she feeling?
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() =>
                  updateProfile((p) => ({ ...p, moods: { ...p.moods, [key]: m.id } }))
                }
                data-active={mood === m.id}
                className="rounded-2xl border border-border px-3 py-2 text-sm transition-all hover:scale-105 data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground"
              >
                <span className="mr-1">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="glass p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="size-4 text-primary" /> Reminders
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {reminders.length ? (
              reminders.map((r) => (
                <li key={r.text} className="flex gap-2">
                  <Egg className="mt-0.5 size-4 shrink-0 text-primary" />
                  {r.text}
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">
                Nothing urgent today — just be present with her.
              </li>
            )}
          </ul>
        </div>
        <div className="glass flex flex-col justify-center p-5">
          <Quote className="size-5 text-primary" />
          <p className="mt-2 font-display text-xl leading-snug">{quote}</p>
        </div>
      </section>
    </div>
  );
}
