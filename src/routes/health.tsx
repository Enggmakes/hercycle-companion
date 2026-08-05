import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse, Info } from "lucide-react";
import { PHASE_INFO, SYMPTOMS } from "@/lib/content";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Cycle Health Guide — HerCycle ❤️" },
      {
        name: "description",
        content:
          "Plain-language guide to the menstrual, follicular, ovulation and luteal phases, PMS symptoms and self-care.",
      },
      { property: "og:title", content: "Cycle Health Guide — HerCycle ❤️" },
      {
        property: "og:description",
        content: "Understand each cycle phase, common symptoms and how to help.",
      },
    ],
  }),
  component: HealthPage,
});

function HealthPage() {
  return (
    <div className="space-y-5">
      <section className="glass p-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <HeartPulse className="size-5 text-primary" /> Understanding her cycle
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A short, kind guide so you know what's happening and how to help.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {PHASE_INFO.map((p) => (
          <article key={p.name} className="glass p-5">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              {p.days}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{p.name}</h2>
            <p className="mt-2 text-sm">{p.body}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>How to help:</strong> {p.care}
            </p>
          </article>
        ))}
      </section>

      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Common symptoms</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <span key={s} className="rounded-full border border-border px-3 py-1 text-sm">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="glass flex gap-3 p-5 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Disclaimer: every cycle is different. All dates here are estimates based on averages
          and are not medical advice, contraception, or a diagnosis. For health concerns,
          please speak with a doctor.
        </p>
      </section>
    </div>
  );
}