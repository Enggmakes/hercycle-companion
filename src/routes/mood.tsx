import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { FileText } from "lucide-react";
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

  const todaySymptoms = profile.symptoms[todayKey] ?? (profile.moods[todayKey] ? [profile.moods[todayKey] as SymptomId] : []);
  const todayFlow = profile.flows[todayKey];

  const toggleSymptom = (symId: SymptomId) => {
    updateProfile((p) => {
      const current = p.symptoms[todayKey] ?? (p.moods[todayKey] ? [p.moods[todayKey] as SymptomId] : []);
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
      const isSelected = p.flows[todayKey] === flow;
      const nextFlows = { ...p.flows };
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
    const syms = profile.symptoms[dt] ?? (profile.moods[dt] ? [profile.moods[dt]] : []);
    return { day: format(d, "d MMM"), count: syms.length };
  });

  const counts = SYMPTOMS.map((s) => {
    let count = 0;
    Object.values(profile.symptoms ?? {}).forEach((arr) => {
      if (Array.isArray(arr) && arr.includes(s.id)) count++;
    });
    return { label: `${s.emoji} ${s.label}`, count };
  });

  return (
    <div className="space-y-5">
      {/* Header & Doctor Export Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Symptom & Mood Tracker</h1>
          <p className="text-sm text-muted-foreground">Select all symptoms & feelings experienced today.</p>
        </div>
        <Button
          onClick={() => generateDoctorPdf(profile)}
          className="rounded-2xl gradient-romance text-primary-foreground shadow-md hover:opacity-95"
        >
          <FileText className="size-4" /> Export Doctor Summary (PDF)
        </Button>
      </div>

      {/* Multi-Symptom Chip Selector */}
      <section className="glass p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Today's Symptoms & Feelings (Tap multiple)
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => {
            const active = todaySymptoms.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSymptom(s.id)}
                className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-medium transition-all active:scale-95 ${
                  active
                    ? "gradient-romance border-transparent text-primary-foreground shadow-md"
                    : "border-border bg-background/50 text-foreground hover:bg-accent"
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Period Flow Selector */}
        <h2 className="mt-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Period Flow (Optional)
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FLOW_LEVELS.map((f) => {
            const active = todayFlow === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFlow(f.id)}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-2.5 text-xs font-medium transition-all active:scale-95 ${
                  active
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-background/50 text-muted-foreground hover:bg-accent"
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 30-Day Symptom Activity */}
      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Logged Symptoms (Last 30 days)</h2>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={20} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  color: "var(--popover-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.25}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Symptom Frequency Stats */}
      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Symptom frequency</h2>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={counts}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={40} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={20} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  color: "var(--popover-foreground)",
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