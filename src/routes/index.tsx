import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Bell,
  Calendar,
  ChevronRight,
  Droplets,
  Heart,
  HeartHandshake,
  PenLine,
  Quote,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import {
  cycleDay,
  currentPhase,
  dayKind,
  fertilityStatus,
  upcoming,
  DAY_META,
  type DayKind,
} from "@/lib/cycle";
import { LOVE_TIPS, QUOTES, pickDaily } from "@/lib/content";
import { MOODS, SYMPTOMS, FLOW_LEVELS, type FlowLevel, type SymptomId } from "@/lib/store";

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

const PHASE_INSIGHTS: Record<string, { summary: string; gesture: string }> = {
  "Menstrual phase": {
    summary: "Energy is naturally lower today. Cramps or fatigue may be present.",
    gesture: "Provide warmth, hot tea, a heating pad, and zero pressure.",
  },
  "Follicular phase": {
    summary: "Estrogen is rising. Mood, mental clarity, and energy are naturally lifting.",
    gesture: "Great day for lighthearted conversation, fun plans, and quality time.",
  },
  "Ovulation phase": {
    summary: "Peak fertility window. Energy, confidence, and warmth reach their monthly peak.",
    gesture: "Mindful communication, sweet compliments, and attentive presence.",
  },
  "Luteal phase": {
    summary: "Body is winding down post-ovulation. A time for calm and steady routines.",
    gesture: "Cook a comforting dinner, keep evenings relaxed, and help with errands.",
  },
  "PMS / late luteal": {
    summary: "Hormone shift window. Sensitivity, food cravings, or tired moments are common.",
    gesture: "Offer extra gentleness, her favorite snacks, quiet patience, and big hugs.",
  },
};

/**
 * Editorial Cycle Horizon Timeline
 * Replaces generic smartwatch circular progress rings with a clear, honest cycle journey.
 */
function CycleJourneyTimeline({
  currentDay,
  cycleLength,
  periodLength,
  kind,
  phaseName,
}: {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  kind: DayKind;
  phaseName: string;
}) {
  const percentage = Math.min(Math.max(((currentDay - 1) / (cycleLength - 1)) * 100, 0), 100);

  // Phase segment percentages
  const periodPct = (periodLength / cycleLength) * 100;
  const ovulationDay = cycleLength - 14;
  const fertileStart = ((ovulationDay - 5) / cycleLength) * 100;
  const fertileWidth = (6 / cycleLength) * 100;
  const pmsStart = ((cycleLength - 5) / cycleLength) * 100;
  const pmsWidth = (5 / cycleLength) * 100;

  const insight = PHASE_INSIGHTS[phaseName] ?? {
    summary: "Listen and be attentive to how she feels today.",
    gesture: "A small act of kindness goes a long way.",
  };

  return (
    <div className="mt-6 rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6">
      {/* Day & Phase Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              Day {currentDay}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              of {cycleLength} days
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span
              className="text-xs sm:text-sm font-bold"
              style={{ color: `var(--${DAY_META[kind].token})` }}
            >
              {phaseName}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {insight.summary} <strong className="text-foreground">{insight.gesture}</strong>
          </p>
        </div>

        <span
          className="badge-phase self-start sm:self-auto shrink-0"
          style={{ backgroundColor: `var(--${DAY_META[kind].token})` }}
        >
          <Sparkles className="size-3.5" />
          <span>{DAY_META[kind].label}</span>
          <span>·</span>
          <span>{fertilityStatus(kind)}</span>
        </span>
      </div>

      {/* Segmented Horizontal Timeline Bar */}
      <div className="mt-5 space-y-2">
        {/* Track Bar with Phase Bands */}
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/70 p-0.5">
          {/* Period segment */}
          <div
            className="absolute top-0.5 bottom-0.5 left-0.5 rounded-l-full opacity-70"
            style={{ width: `${periodPct}%`, backgroundColor: "var(--phase-period)" }}
            title="Period Phase"
          />
          {/* Fertile window segment */}
          <div
            className="absolute top-0.5 bottom-0.5 opacity-70"
            style={{
              left: `${fertileStart}%`,
              width: `${fertileWidth}%`,
              backgroundColor: "var(--phase-fertile)",
            }}
            title="Fertile Window"
          />
          {/* Ovulation marker point */}
          <div
            className="absolute top-0 bottom-0 z-10 w-1.5 -translate-x-1/2 rounded-full"
            style={{
              left: `${(ovulationDay / cycleLength) * 100}%`,
              backgroundColor: "var(--phase-ovulation)",
            }}
            title="Ovulation Day"
          />
          {/* PMS segment */}
          <div
            className="absolute top-0.5 bottom-0.5 right-0.5 rounded-r-full opacity-70"
            style={{
              left: `${pmsStart}%`,
              width: `${pmsWidth}%`,
              backgroundColor: "var(--phase-pms)",
            }}
            title="PMS Window"
          />

          {/* Current Day Pointer Pin */}
          <div
            className="absolute top-1/2 z-20 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-md transition-all duration-700"
            style={{
              left: `${percentage}%`,
              backgroundColor: `var(--${DAY_META[kind].token})`,
            }}
          />
        </div>

        {/* Phase Legend Markers under bar */}
        <div className="flex justify-between pt-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1" style={{ color: "var(--phase-period)" }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--phase-period)" }} />
            Period (1–{periodLength})
          </span>
          <span className="flex items-center gap-1" style={{ color: "var(--phase-fertile)" }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--phase-fertile)" }} />
            Fertile (Days {ovulationDay - 5}–{ovulationDay + 1})
          </span>
          <span className="flex items-center gap-1" style={{ color: "var(--phase-ovulation)" }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--phase-ovulation)" }} />
            Ovulation (Day {ovulationDay})
          </span>
          <span className="flex items-center gap-1" style={{ color: "var(--phase-pms)" }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--phase-pms)" }} />
            PMS (Days {cycleLength - 5}–{cycleLength})
          </span>
        </div>
      </div>
    </div>
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

  const activeMood = profile.moods[key];
  const activeSymptoms = (profile.symptoms[key] ?? []) as SymptomId[];
  const activeFlow = profile.flows?.[key] as FlowLevel | undefined;

  const curDay = cycleDay(s, today);
  const phaseName = currentPhase(s, today);

  const reminders = [
    { on: up.daysTo(up.nextPeriod) <= 5 && up.daysTo(up.nextPeriod) > 2, text: "Period is close (~5 days) — stock up on her essentials, favorite treats, and soothing comforts." },
    { on: up.daysTo(up.nextPeriod) <= 2 && up.daysTo(up.nextPeriod) > 0, text: "Period is about 2 days away — prepare a warm heating pad, run an easy evening, and bring extra tenderness." },
    { on: kind === "period", text: "Today is a period day — extra warmth, quiet presence, herbal tea, and patient tenderness make all the difference." },
    { on: kind === "ovulation", text: "Ovulation window today — energy and emotion may peak; be attentive and communicative." },
    { on: kind === "fertile", text: "Fertile window is currently active." },
    { on: kind === "pms", text: "PMS phase active — be quick to offer gentle hugs, comfortable clothes, and low-stress plans." },
  ].filter((r) => r.on);

  const countdowns = [
    {
      label: "Next period",
      days: up.daysTo(up.nextPeriod),
      date: format(up.nextPeriod, "d MMM"),
      token: "phase-period",
    },
    {
      label: "Fertile window",
      days: up.daysTo(up.nextFertile),
      date: format(up.nextFertile, "d MMM"),
      token: "phase-fertile",
    },
    {
      label: "Ovulation",
      days: up.daysTo(up.nextOvulation),
      date: format(up.nextOvulation, "d MMM"),
      token: "phase-ovulation",
    },
    {
      label: "PMS begins",
      days: up.daysTo(up.nextPms),
      date: format(up.nextPms, "d MMM"),
      token: "phase-pms",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header & Cycle Journey Timeline */}
      <section className="glass p-6 sm:p-8 animate-enter">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {format(today, "EEEE, d MMMM yyyy")}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Take care of {profile.name || "her"} today
            </h1>
          </div>

          <Link
            to="/calendar"
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-card"
          >
            <Calendar className="size-3.5 text-primary" />
            <span>Open Cycle Calendar</span>
            <ChevronRight className="size-3 text-muted-foreground" />
          </Link>
        </div>

        {/* Clear, Editorial Cycle Journey Timeline (No AI Slop Ring) */}
        <CycleJourneyTimeline
          currentDay={curDay}
          cycleLength={s.cycleLength}
          periodLength={s.periodLength}
          kind={kind}
          phaseName={phaseName}
        />
      </section>

      {/* Cycle Milestones / Countdowns */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 animate-enter" style={{ animationDelay: '80ms' }}>
        {countdowns.map((c) => (
          <div
            key={c.label}
            className={`glass group relative overflow-hidden p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated glass-hover-glow animate-enter stagger-${(countdowns.indexOf(c) % 4) + 1}`}
          >
            <div
              className="absolute top-0 inset-x-0 h-1 transition-opacity duration-300 opacity-60 group-hover:opacity-100"
              style={{ backgroundColor: `var(--${c.token})` }}
            />
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {c.label}
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className="font-display text-3xl font-semibold sm:text-4xl"
                style={{ color: `var(--${c.token})` }}
              >
                {c.days}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {c.days === 1 ? "day away" : "days away"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Expected {c.date}</p>
          </div>
        ))}
      </section>

      {/* Actionable Care Tip & Mood / Symptoms Check-in */}
      <section className="grid gap-5 md:grid-cols-2 animate-enter" style={{ animationDelay: '160ms' }}>
        {/* Curated Love Reminder */}
        <div className="glass flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <HeartHandshake className="size-4" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Today&apos;s Caring Reminder
              </h2>
            </div>
            <p className="mt-3.5 text-base leading-relaxed text-foreground">
              {tip}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
            <Link
              to="/notes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:underline"
            >
              <PenLine className="size-3.5" />
              <span>Write a love note or reminder</span>
              <ChevronRight className="size-3" />
            </Link>
            <Link
              to="/health"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Phase guide →
            </Link>
          </div>
        </div>

        {/* How Is She Feeling? Mood & Symptom Touchpoint */}
        <div className="glass p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <Heart className="size-4" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                How is {profile.name || "she"} feeling?
              </h2>
            </div>
            <Link
              to="/mood"
              className="text-xs font-semibold text-primary hover:underline"
            >
              History →
            </Link>
          </div>

          {/* Mood Pill Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {MOODS.map((m) => {
              const isSelected = activeMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    updateProfile((p) => ({
                      ...p,
                      moods: { ...p.moods, [key]: m.id },
                    }))
                  }
                  data-active={isSelected}
                  className="press-spring flex items-center gap-1.5 rounded-2xl border border-border bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-primary/40 hover:text-foreground data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground data-[active=true]:border-transparent data-[active=true]:shadow-sm"
                >
                  <span className="text-sm">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Symptoms Quick Badges */}
          <div className="mt-5 pt-4 border-t border-border/70">
            <p className="text-xs font-medium text-muted-foreground mb-2.5">
              Common feelings & symptoms today:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOMS.slice(0, 6).map((sym) => {
                const isActive = activeSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() =>
                      updateProfile((p) => {
                        const cur = (p.symptoms[key] ?? []) as SymptomId[];
                        const next = cur.includes(sym.id)
                          ? cur.filter((x) => x !== sym.id)
                          : [...cur, sym.id];
                        return {
                          ...p,
                          symptoms: { ...p.symptoms, [key]: next },
                        };
                      })
                    }
                    data-active={isActive}
                    className="press-spring flex items-center gap-1 rounded-xl border border-border/70 bg-card/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground data-[active=true]:bg-primary/15 data-[active=true]:border-primary/60 data-[active=true]:text-foreground"
                  >
                    <span>{sym.emoji}</span>
                    <span>{sym.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flow Level (displayed if period phase) */}
          {kind === "period" && (
            <div className="mt-4 pt-3 border-t border-border/70">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <Droplets className="size-3.5 text-primary" />
                <span>Flow intensity:</span>
              </p>
              <div className="flex gap-2">
                {FLOW_LEVELS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      updateProfile((p) => ({
                        ...p,
                        flows: { ...(p.flows ?? {}), [key]: f.id },
                      }))
                    }
                    data-active={activeFlow === f.id}
                    className="flex-1 rounded-xl border border-border/80 py-1.5 text-center text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 data-[active=true]:bg-primary/20 data-[active=true]:border-primary data-[active=true]:text-foreground"
                  >
                    <span className="block text-[10px] opacity-75">{f.icon}</span>
                    <span className="block font-medium">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gentle Reminders & Hand-Set Quote */}
      <section className="grid gap-5 md:grid-cols-2 animate-enter" style={{ animationDelay: '240ms' }}>
        {/* Heads Up Reminders */}
        <div className="glass p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bell className="size-4" />
            </span>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Gentle Reminders
            </h2>
          </div>

          <ul className="mt-4 space-y-3">
            {reminders.length ? (
              reminders.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/50 p-3 text-sm leading-snug text-foreground"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary text-xs">
                    ✦
                  </span>
                  <span>{r.text}</span>
                </li>
              ))
            ) : (
              <li className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary shrink-0" />
                <span>No high-priority alerts today — simply be present, listen, and share quiet love.</span>
              </li>
            )}
          </ul>
        </div>

        {/* Heirloom Quote Card */}
        <div className="glass relative overflow-hidden flex flex-col justify-center p-6 text-center md:text-left">
          {/* Decorative top accent */}
          <div className="absolute top-0 inset-x-0 h-0.5 gradient-romance" />
          <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
            <Quote className="size-5" />
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Words of Love
            </span>
          </div>
          <p className="mt-3 font-display text-xl italic leading-relaxed text-foreground sm:text-2xl">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </section>
    </div>
  );
}
