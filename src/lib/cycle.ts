import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";

export type CycleSettings = {
  lastPeriodStart: string; // yyyy-MM-dd
  cycleLength: number;
  periodLength: number;
};

export type DayKind = "period" | "fertile" | "ovulation" | "pms" | "safe";

export const DAY_META: Record<DayKind, { label: string; token: string }> = {
  period: { label: "Period", token: "phase-period" },
  fertile: { label: "Fertile window", token: "phase-fertile" },
  ovulation: { label: "Ovulation", token: "phase-ovulation" },
  pms: { label: "PMS", token: "phase-pms" },
  safe: { label: "Safe day", token: "phase-safe" },
};

export const parseDate = (value: string) => startOfDay(new Date(`${value}T00:00:00`));
export const toKey = (d: Date) => format(d, "yyyy-MM-dd");

/** Start date of the cycle containing `date`, plus the cycle index offset. */
export function cycleStartFor(settings: CycleSettings, date: Date) {
  const base = parseDate(settings.lastPeriodStart);
  const diff = differenceInCalendarDays(startOfDay(date), base);
  const index = Math.floor(diff / settings.cycleLength);
  return { start: addDays(base, index * settings.cycleLength), index };
}

export function cycleDay(settings: CycleSettings, date = new Date()) {
  const { start } = cycleStartFor(settings, date);
  return differenceInCalendarDays(startOfDay(date), start) + 1;
}

export function cycleMarkers(settings: CycleSettings, start: Date) {
  const ovulation = addDays(start, settings.cycleLength - 14);
  return {
    start,
    periodEnd: addDays(start, settings.periodLength - 1),
    fertileStart: addDays(ovulation, -5),
    fertileEnd: addDays(ovulation, 1),
    ovulation,
    pmsStart: addDays(start, settings.cycleLength - 5),
    pmsEnd: addDays(start, settings.cycleLength - 1),
    nextStart: addDays(start, settings.cycleLength),
  };
}

export function dayKind(settings: CycleSettings, date: Date): DayKind {
  const d = startOfDay(date);
  const { start } = cycleStartFor(settings, d);
  const m = cycleMarkers(settings, start);
  if (d >= m.start && d <= m.periodEnd) return "period";
  if (isSameDay(d, m.ovulation)) return "ovulation";
  if (d >= m.fertileStart && d <= m.fertileEnd) return "fertile";
  if (d >= m.pmsStart && d <= m.pmsEnd) return "pms";
  return "safe";
}

export function currentPhase(settings: CycleSettings, date = new Date()) {
  const day = cycleDay(settings, date);
  if (day <= settings.periodLength) return "Menstrual phase";
  const ov = settings.cycleLength - 13;
  if (day < ov - 5) return "Follicular phase";
  if (day <= ov + 1) return "Ovulation phase";
  if (day > settings.cycleLength - 5) return "PMS / late luteal";
  return "Luteal phase";
}

export function upcoming(settings: CycleSettings, today = new Date()) {
  const t = startOfDay(today);
  const { start } = cycleStartFor(settings, t);
  let m = cycleMarkers(settings, start);
  const nextOvulation =
    m.ovulation >= t ? m.ovulation : cycleMarkers(settings, m.nextStart).ovulation;
  const nextFertile =
    m.fertileStart >= t ? m.fertileStart : cycleMarkers(settings, m.nextStart).fertileStart;
  const nextPms = m.pmsStart >= t ? m.pmsStart : cycleMarkers(settings, m.nextStart).pmsStart;
  const nextPeriod = m.nextStart;
  if (m.start >= t) m = cycleMarkers(settings, start);
  return {
    nextPeriod,
    nextOvulation,
    nextFertile,
    nextPms,
    daysTo: (d: Date) => differenceInCalendarDays(d, t),
  };
}

export function futureCycles(settings: CycleSettings, count = 12, from = new Date()) {
  const { start } = cycleStartFor(settings, from);
  return Array.from({ length: count }, (_, i) =>
    cycleMarkers(settings, addDays(start, (i + 1) * settings.cycleLength)),
  );
}

export function fertilityStatus(kind: DayKind) {
  switch (kind) {
    case "ovulation":
      return "Peak fertility";
    case "fertile":
      return "High fertility";
    case "period":
      return "Very low fertility";
    case "pms":
      return "Low fertility";
    default:
      return "Low fertility";
  }
}