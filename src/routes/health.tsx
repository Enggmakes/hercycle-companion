import { createFileRoute } from "@tanstack/react-router";
import {
  Coffee,
  FileText,
  Heart,
  HeartPulse,
  Info,
  Moon,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import { PHASE_INFO, SYMPTOMS } from "@/lib/content";
import { useStore } from "@/lib/store-context";
import { generateDoctorPdf } from "@/lib/pdf-export";
import { Button } from "@/components/ui/button";

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

const PHASE_ICONS = [
  { icon: Moon, color: "var(--phase-period)" },
  { icon: Sparkles, color: "var(--phase-fertile)" },
  { icon: Sun, color: "var(--phase-ovulation)" },
  { icon: Coffee, color: "var(--phase-safe)" },
  { icon: Zap, color: "var(--phase-pms)" },
];

function HealthPage() {
  const { profile, ready } = useStore();
  if (!ready || !profile) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="glass flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center animate-enter">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Understanding Her Cycle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A gentle, partner-first guide to her body&apos;s natural rhythms and how to support her best.
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

      {/* Phase Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PHASE_INFO.map((p, index) => {
          const config = PHASE_ICONS[index % PHASE_ICONS.length] ?? PHASE_ICONS[0]!;
          const Icon = config.icon;
          const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

          return (
            <article
              key={p.name}
              className={`glass glass-hover-glow group relative flex flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-1 animate-enter ${staggerClass}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold tracking-wider uppercase"
                    style={{ color: config.color }}
                  >
                    {p.days}
                  </span>
                  <span
                    className="grid size-8 place-items-center rounded-xl bg-card/80 border border-border/80"
                    style={{ color: config.color }}
                  >
                    <Icon className="size-4" />
                  </span>
                </div>

                <h2 className="mt-2 font-display text-lg font-semibold text-foreground">
                  {p.name}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>

              {/* How to Help Callout */}
              <div className="mt-4 rounded-xl border border-border/70 bg-card/60 p-3">
                <p className="text-[11px] font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="size-3 text-primary" />
                  <span>How you can care:</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-foreground">
                  {p.care}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {/* Common Signs & Symptoms */}
      <section className="glass p-6 animate-enter [animation-delay:200ms]">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Common Physical & Emotional Sensations
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Every person experiences cycles uniquely. These are common patterns across phases:
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <span
              key={s}
              className="rounded-xl border border-border/80 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:scale-105"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Tender Disclaimer Card */}
      <section className="glass flex items-start gap-3 p-5 text-xs text-muted-foreground animate-enter [animation-delay:260ms]">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="leading-relaxed">
          <strong className="text-foreground">Caring Note:</strong> Every cycle and body is unique.
          All estimates and countdowns here are mathematical calculations based on average cycle lengths
          and are never intended as medical advice, diagnostic proof, or contraception. Always consult a
          healthcare professional for medical questions.
        </p>
      </section>
    </div>
  );
}