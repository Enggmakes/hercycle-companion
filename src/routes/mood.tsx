import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
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
import { MOODS } from "@/lib/store";

export const Route = createFileRoute("/mood")({
  head: () => ({
    meta: [
      { title: "Mood Tracker — HerCycle ❤️" },
      {
        name: "description",
        content: "Log daily moods and see how she has been feeling across the last 30 days.",
      },
      { property: "og:title", content: "Mood Tracker — HerCycle ❤️" },
      {
        property: "og:description",
        content: "Daily mood logging with 30-day trends and frequency charts.",
      },
    ],
  }),
  component: MoodPage,
});

function MoodPage() {
  const { profile, updateProfile, ready } = useStore();
  if (!ready) return null;

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
  const trend = days.map((d) => {
    const id = profile.moods[format(d, "yyyy-MM-dd")];
    const m = MOODS.find((x) => x.id === id);
    return { day: format(d, "d MMM"), score: m?.score ?? null, label: m?.label ?? "—" };
  });
  const counts = MOODS.map((m) => ({
    label: `${m.emoji} ${m.label}`,
    count: Object.values(profile.moods).filter((v) => v === m.id).length,
  }));

  return (
    <div className="space-y-5">
      <section className="glass p-5">
        <h1 className="text-2xl font-semibold">Mood tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tap how she feels today.</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() =>
                updateProfile((p) => ({ ...p, moods: { ...p.moods, [todayKey]: m.id } }))
              }
              data-active={profile.moods[todayKey] === m.id}
              className="rounded-2xl border border-border py-3 text-center text-xs transition-transform hover:scale-105 data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground"
            >
              <span className="block text-2xl">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Last 30 days</h2>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} width={20} />
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
                dataKey="score"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.25}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Mood frequency</h2>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={counts}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
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