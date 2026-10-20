import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Heart,
  Info,
  Sparkles,
  Star,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import {
  DAY_META,
  cycleDay,
  currentPhase,
  dayKind,
  fertilityStatus,
  futureCycles,
  type DayKind,
} from "@/lib/cycle";
import { MOODS, SYMPTOMS, FLOW_LEVELS } from "@/lib/store";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Cycle Calendar — HerCycle ❤️" },
      {
        name: "description",
        content:
          "Monthly calendar with period, fertile window, ovulation, PMS and safe days, plus a 12-month forecast.",
      },
      { property: "og:title", content: "Cycle Calendar — HerCycle ❤️" },
      {
        property: "og:description",
        content: "Colour-coded period, fertile, ovulation, PMS and safe days at a glance.",
      },
    ],
  }),
  component: CalendarPage,
});

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PHASE_TIPS: Record<DayKind, { title: string; advice: string }> = {
  period: {
    title: "Period Phase",
    advice: "Warmth, hot water bottle or heating pad, iron-rich foods, comforting tea, and slow evenings.",
  },
  fertile: {
    title: "Fertile Window",
    advice: "Energy and intimacy are naturally rising. Great time for meaningful quality time together.",
  },
  ovulation: {
    title: "Ovulation Day (Peak Fertility)",
    advice: "Peak energy and confidence. Communicate mindfully regarding family planning goals.",
  },
  pms: {
    title: "PMS Phase",
    advice: "Hormones are shifting. Offer extra patience, gentle physical affection, comfort food, and zero stress.",
  },
  safe: {
    title: "Safe Days (Low Fertility)",
    advice: "Stable everyday energy. Great for normal routines, dates, outdoor walks, and relaxation.",
  },
};

function CalendarPage() {
  const { profile, ready } = useStore();
  const [offset, setOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  if (!ready) return null;

  const s = profile.settings;
  const month = addMonths(new Date(), offset);
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const lead = (startOfMonth(month).getDay() + 6) % 7;
  const today = new Date();

  // Selected date details
  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const selectedKind = dayKind(s, selectedDate);
  const selectedDayNum = cycleDay(s, selectedDate);
  const selectedPhase = currentPhase(s, selectedDate);
  const selectedMood = profile.moods?.[selectedKey];
  const selectedSymptoms = profile.symptoms?.[selectedKey] ?? [];
  const selectedFlow = profile.flows?.[selectedKey];

  const moodItem = MOODS.find((m) => m.id === selectedMood);
  const flowItem = FLOW_LEVELS.find((f) => f.id === selectedFlow);
  const phaseTip = PHASE_TIPS[selectedKind];

  return (
    <div className="space-y-6">
      {/* Month Navigation & Colored Calendar Card */}
      <section className="glass overflow-hidden p-5 sm:p-7 animate-enter">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/70">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setOffset((o) => o - 1)}
            className="press-spring grid size-10 place-items-center rounded-2xl border border-border bg-card/60 transition-all hover:scale-105 hover:border-primary/50"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {format(month, "MMMM yyyy")}
            </h1>
            {offset !== 0 && (
              <button
                type="button"
                onClick={() => {
                  setOffset(0);
                  setSelectedDate(new Date());
                }}
                className="mt-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                Jump to Current Month
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label="Next month"
            onClick={() => setOffset((o) => o + 1)}
            className="press-spring grid size-10 place-items-center rounded-2xl border border-border bg-card/60 transition-all hover:scale-105 hover:border-primary/50"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Weekday Labels */}
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {WEEK.map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Colored Tiles Matrix (Restoring the beloved color-blocked readability + enhanced polish) */}
        <div className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: lead }).map((_, i) => (
            <div key={`lead-${i}`} className="aspect-square opacity-0" />
          ))}

          {days.map((d) => {
            const kind = dayKind(s, d);
            const isToday = isSameDay(d, today);
            const isSelected = isSameDay(d, selectedDate);
            const inMonth = isSameMonth(d, month);

            const meta = DAY_META[kind];

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setSelectedDate(d)}
                data-selected={isSelected}
                data-today={isToday}
                data-dim={!inMonth}
                className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl p-1 text-center font-bold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 data-[dim=true]:opacity-35 ${isToday ? 'pulse-today' : ''}`}
                style={{
                  backgroundColor: `var(--${meta.token})`,
                  color: "#ffffff",
                  outline: isSelected
                    ? "3px solid var(--foreground)"
                    : isToday
                    ? "2px dashed #ffffff"
                    : undefined,
                  outlineOffset: isSelected ? 2 : 1,
                  boxShadow: isSelected
                    ? "0 8px 20px -4px oklch(0 0 0 / 40%)"
                    : "0 2px 6px -1px oklch(0 0 0 / 15%)",
                }}
              >
                {/* Ovulation Star Badge */}
                {kind === "ovulation" && (
                  <Star className="absolute top-1 right-1 size-2.5 fill-current text-white/90" />
                )}

                {/* Today Small Pill */}
                {isToday && (
                  <span className="absolute top-1 left-1 rounded-full bg-black/30 px-1 py-0.2 text-[8px] font-black tracking-tight uppercase">
                    Today
                  </span>
                )}

                {/* Day Number */}
                <span className="font-display text-base sm:text-lg font-bold leading-none drop-shadow-sm">
                  {format(d, "d")}
                </span>

                {/* Short Sub-label for instant comprehension */}
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-tight opacity-90 leading-tight">
                  {kind === "period"
                    ? "Period"
                    : kind === "ovulation"
                    ? "Ovul."
                    : kind === "fertile"
                    ? "Fertile"
                    : kind === "pms"
                    ? "PMS"
                    : "Safe"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Understandable Phase Legend with color swatches & explanations */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 pt-5 border-t border-border/70 text-xs">
          {(Object.keys(DAY_META) as DayKind[]).map((k) => (
            <div
              key={k}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 p-2 font-medium"
            >
              <span
                className="size-3.5 shrink-0 rounded-full shadow-sm"
                style={{ backgroundColor: `var(--${DAY_META[k].token})` }}
              />
              <div className="min-w-0">
                <p className="truncate font-bold text-foreground text-[11px] leading-tight">
                  {DAY_META[k].label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {k === "period"
                    ? `${s.periodLength} days`
                    : k === "fertile"
                    ? "Conception window"
                    : k === "ovulation"
                    ? "Peak fertility day"
                    : k === "pms"
                    ? "Late luteal phase"
                    : "Low fertility"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Day Inspector — Makes every calendar day 100% understandable */}
      <section className="glass p-6 animate-enter" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <CalendarIcon className="size-4" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                {format(selectedDate, "EEEE, d MMMM yyyy")}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Cycle <strong className="text-foreground">Day {selectedDayNum}</strong> of {s.cycleLength} · {selectedPhase}
            </p>
          </div>

          <span
            className="badge-phase self-start sm:self-auto shrink-0"
            style={{ backgroundColor: `var(--${DAY_META[selectedKind].token})` }}
          >
            <Sparkles className="size-3.5" />
            <span>{DAY_META[selectedKind].label}</span>
            <span>·</span>
            <span>{fertilityStatus(selectedKind)}</span>
          </span>
        </div>

        {/* Partner Care Advice for This Specific Day & Phase */}
        <div className="mt-4 rounded-2xl border border-border/80 bg-card/60 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide">
            <Heart className="size-3.5" />
            <span>How to Care for Her on {format(selectedDate, "d MMMM")}:</span>
          </p>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-foreground">
            {phaseTip.advice}
          </p>
        </div>

        {/* Logged Mood, Flow & Symptoms on Selected Date */}
        {(moodItem || selectedSymptoms.length > 0 || flowItem) ? (
          <div className="mt-4 rounded-2xl border border-border/80 bg-card/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Logged on this date:
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {moodItem && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 font-semibold text-foreground">
                  <span>{moodItem.emoji}</span>
                  <span>{moodItem.label}</span>
                </span>
              )}

              {flowItem && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 font-semibold text-foreground">
                  <Droplets className="size-3 text-primary" />
                  <span>Flow: {flowItem.label}</span>
                </span>
              )}

              {selectedSymptoms.map((symId) => {
                const found = SYMPTOMS.find((s) => s.id === symId);
                if (!found) return null;
                return (
                  <span
                    key={symId}
                    className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-card/60 px-2.5 py-1 text-muted-foreground"
                  >
                    <span>{found.emoji}</span>
                    <span>{found.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            No symptoms or mood logged for this date yet.
          </p>
        )}
      </section>

      {/* 12 Months Forward Forecast */}
      <section className="glass p-6 animate-enter" style={{ animationDelay: '180ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Upcoming Cycles (Next 12 Months Forecast)
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {s.cycleLength}-day cycle cycle basis
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {futureCycles(s, 12).map((c, idx) => (
            <div
              key={c.start.toISOString()}
              className={`group relative overflow-hidden rounded-2xl border border-border/80 bg-card/50 p-4 transition-all duration-300 hover:border-primary/40 hover:bg-card/80 hover:-translate-y-0.5 glass-hover-glow animate-enter stagger-${(idx % 6) + 1}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  Cycle #{idx + 1}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {format(c.start, "MMMM yyyy")}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="font-display text-lg font-semibold text-foreground">
                  Period: {format(c.start, "d MMM")} – {format(c.periodEnd, "d MMM")}
                </span>
              </div>

              <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: "var(--phase-ovulation)" }} />
                  <span>Ovulation: <strong className="text-foreground">{format(c.ovulation, "EEEE, d MMMM")}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: "var(--phase-fertile)" }} />
                  <span>Fertile window: {format(c.fertileStart, "d MMM")} – {format(c.fertileEnd, "d MMM")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: "var(--phase-pms)" }} />
                  <span>PMS begins: {format(c.pmsStart, "d MMM")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}