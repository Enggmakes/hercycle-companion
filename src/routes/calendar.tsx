import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { DAY_META, dayKind, futureCycles, type DayKind } from "@/lib/cycle";

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

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

function CalendarPage() {
  const { profile, ready } = useStore();
  const [offset, setOffset] = useState(0);
  if (!ready) return null;

  const s = profile.settings;
  const month = addMonths(new Date(), offset);
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const lead = (startOfMonth(month).getDay() + 6) % 7;
  const today = new Date();

  return (
    <div className="space-y-5">
      <section className="glass p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <button
            aria-label="Previous month"
            onClick={() => setOffset((o) => o - 1)}
            className="grid size-9 place-items-center rounded-full border border-border"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h1 className="truncate text-center text-xl font-semibold">
            {format(month, "MMMM yyyy")}
          </h1>
          <button
            aria-label="Next month"
            onClick={() => setOffset((o) => o + 1)}
            className="grid size-9 place-items-center rounded-full border border-border"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEK.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: lead }).map((_, i) => (
            <span key={`x${i}`} />
          ))}
          {days.map((d) => {
            const kind = dayKind(s, d);
            const isToday = isSameDay(d, today);
            return (
              <div
                key={d.toISOString()}
                className="aspect-square transition-transform hover:scale-105"
              >
                <div
                  className="flex size-full flex-col items-center justify-center rounded-2xl text-sm font-semibold text-primary-foreground data-[dim=true]:opacity-40"
                  data-dim={!isSameMonth(d, month)}
                  style={{
                    backgroundColor: `var(--${DAY_META[kind].token})`,
                    outline: isToday ? "2px solid var(--foreground)" : undefined,
                    outlineOffset: 2,
                  }}
                >
                  {format(d, "d")}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {(Object.keys(DAY_META) as DayKind[]).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: `var(--${DAY_META[k].token})` }}
              />
              {DAY_META[k].label}
            </span>
          ))}
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Next 12 cycles</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {futureCycles(s, 12).map((c) => (
            <div
              key={c.start.toISOString()}
              className="rounded-2xl border border-border p-3 text-sm"
            >
              <p className="font-semibold">
                Period {format(c.start, "d MMM")} – {format(c.periodEnd, "d MMM")}
              </p>
              <p className="text-muted-foreground">
                Ovulation {format(c.ovulation, "d MMM")} · Fertile{" "}
                {format(c.fertileStart, "d MMM")}–{format(c.fertileEnd, "d MMM")} · PMS from{" "}
                {format(c.pmsStart, "d MMM")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}