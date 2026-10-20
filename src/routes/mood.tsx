import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { Activity, BarChart3, Droplets, FileText, Heart, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store-context";
import { FLOW_LEVELS, SYMPTOMS, type FlowLevel, type SymptomId } from "@/lib/store";
import { generateDoctorPdf } from "@/lib/pdf-export";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mood")({
  head: () => ({
    meta: [
      { title: "Symptom & Mood Tracker — HerCycle ❤️" },
      {
        name: "description",
        content: "Log daily multi-symptoms, period flow, moods, and generate Doctor PDF Summaries.",
      },
      { property: "og:title", content: "Symptom & Mood Tracker — HerCycle ❤️" },
      {
        property: "og:description",
        content: "Multi-symptom logging, flow level tracking, 30-day trends and Doctor PDF export.",
      },
    ],
  }),
  component: MoodPage,
});

function MoodPage() {
  const { profile, updateProfile, ready } = useStore();
  if (!ready) return null;

  const todayKey = format(new Date(), "yyyy-MM-dd");

  const todaySymptoms = (profile.symptoms?.[todayKey] ?? (profile.moods?.[todayKey] ? [profile.moods[todayKey] as SymptomId] : [])) as SymptomId[];
  const todayFlow = profile.flows?.[todayKey];

  const toggleSymptom = (symId: SymptomId) => {
    updateProfile((p) => {
      const current = (p.symptoms?.[todayKey] ?? (p.moods?.[todayKey] ? [p.moods[todayKey] as SymptomId] : [])) as SymptomId[];
      const exists = current.includes(symId);
      const next = exists ? current.filter((x) => x !== symId) : [...current, symId];
      return {
        ...p,
        symptoms: { ...p.symptoms, [todayKey]: next },
      };
    });
  };

  const setFlow = (flow: FlowLevel) => {
    updateProfile((p) => {
      const isSelected = p.flows?.[todayKey] === flow;
      const nextFlows = { ...(p.flows ?? {}) };
      if (isSelected) {
        delete nextFlows[todayKey];
      } else {
        nextFlows[todayKey] = flow;
      }
      return { ...p, flows: nextFlows };
    });
  };

  // Trend & Counts for charts
  const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
  const trend = days.map((d) => {
    const dt = format(d, "yyyy-MM-dd");
    const syms = (profile.symptoms?.[dt] ?? (profile.moods?.[dt] ? [profile.moods[dt]] : []));
    return { day: format(d, "d MMM"), count: syms.length };
  });

  const physicalSymptoms = SYMPTOMS.filter((s) => s.category === "physical");
  const emotionalSymptoms = SYMPTOMS.filter((s) => s.category === "emotional");

  const counts = SYMPTOMS.map((s) => {
    let count = 0;
    Object.values(profile.symptoms ?? {}).forEach((arr) => {
      if (Array.isArray(arr) && arr.includes(s.id)) count++;
    });
    return { label: s.label, count };
  }).sort((a, b) => b.count - a.count);

  const topSymptom = counts.find((c) => c.count > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="glass flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center animate-enter">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Symptom & Mood Journal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log today&apos;s physical and emotional feelings for {profile.name || "her"}.
          </p>
        </div>

        <Button
          onClick={() => generateDoctorPdf(profile)}
          className="rounded-2xl gradient-romance text-primary-foreground shadow-sm hover:opacity-95 text-xs font-semibold px-4 py-2 press-spring"
        >
          <FileText className="size-4 mr-1.5" />
          <span>Export Doctor Summary (PDF)</span>
        </Button>
      </section>

      {/* Multi-Symptom Chip Selector */}
      <section className="glass p-6 animate-enter [animation-delay:80ms]">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Today&apos;s Feelings & Symptoms
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Tap any symptom to toggle it on or off for today.
        </p>

        {/* Physical Category */}
        <div className="mt-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Physical Sensations
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {physicalSymptoms.map((s) => {
              const active = todaySymptoms.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSymptom(s.id)}
                  data-active={active}
                  className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/60 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 press-spring hover:scale-105 hover:border-primary/50 hover:text-foreground data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground data-[active=true]:border-transparent data-[active=true]:shadow-sm"
                >
                  <span className="text-sm">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emotional Category */}
        <div className="mt-5 pt-4 border-t border-border/70">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Emotional & Mood
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {emotionalSymptoms.map((s) => {
              const active = todaySymptoms.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSymptom(s.id)}
                  data-active={active}
                  className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/60 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 press-spring hover:scale-105 hover:border-primary/50 hover:text-foreground data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground data-[active=true]:border-transparent data-[active=true]:shadow-sm"
                >
                  <span className="text-sm">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Period Flow Selector */}
        <div className="mt-6 pt-5 border-t border-border/70">
          <div className="flex items-center gap-2">
            <Droplets className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Period Flow Intensity (Optional)
            </h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {FLOW_LEVELS.map((f) => {
              const active = todayFlow === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFlow(f.id)}
                  data-active={active}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border/80 bg-card/50 p-3 text-xs font-medium text-muted-foreground transition-all duration-200 press-spring hover:scale-102 hover:border-primary/50 data-[active=true]:bg-primary/15 data-[active=true]:border-primary data-[active=true]:text-foreground"
                >
                  <span className="text-sm">{f.icon}</span>
                  <span className="font-semibold">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 30-Day Symptom Activity Trend */}
      <section className="glass p-6 animate-enter [animation-delay:140ms]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              30-Day Symptom Activity
            </h2>
          </div>
          {topSymptom && (
            <span className="text-xs font-medium text-muted-foreground">
              Most frequent: <strong className="text-foreground">{topSymptom.label}</strong> ({topSymptom.count}x)
            </span>
          )}
        </div>

        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: 16,
                  color: "var(--foreground)",
                  boxShadow: "var(--shadow-soft)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="var(--primary)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Symptom Frequency Distribution */}
      <section className="glass p-6 animate-enter [animation-delay:200ms]">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Symptom Frequency Breakdown
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Historical occurrences across all logged entries.
        </p>

        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={counts.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={40}
                stroke="var(--muted-foreground)"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: 16,
                  color: "var(--foreground)",
                  boxShadow: "var(--shadow-soft)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}