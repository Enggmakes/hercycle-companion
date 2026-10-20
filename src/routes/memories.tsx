import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Gift,
  Heart,
  Plus,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import type { Memory } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "Our Memories — HerCycle ❤️" },
      {
        name: "description",
        content:
          "Remember anniversaries, birthdays, first dates, gift ideas and wishlist items in one private place.",
      },
      { property: "og:title", content: "Our Memories — HerCycle ❤️" },
      {
        property: "og:description",
        content: "Anniversaries, birthdays, special moments, gift ideas and wishlists.",
      },
    ],
  }),
  component: MemoriesPage,
});

const KINDS: { id: Memory["kind"]; label: string; emoji: string }[] = [
  { id: "moment", label: "Special moment", emoji: "💖" },
  { id: "anniversary", label: "Anniversary", emoji: "💍" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "first-date", label: "First date", emoji: "✨" },
  { id: "gift", label: "Gift idea", emoji: "🎁" },
  { id: "wishlist", label: "Wishlist", emoji: "📜" },
];

function MemoriesPage() {
  const { profile, updateProfile, ready } = useStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [kind, setKind] = useState<Memory["kind"]>("moment");
  const [filter, setFilter] = useState<string>("all");

  if (!ready) return null;

  const add = () => {
    const clean = title.trim().slice(0, 120);
    if (!clean) return;
    updateProfile((p) => ({
      ...p,
      memories: [
        ...(p.memories ?? []),
        { id: Math.random().toString(36).slice(2), title: clean, date, kind },
      ],
    }));
    setTitle("");
  };

  const allMemories = [...(profile.memories ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const filtered = filter === "all"
    ? allMemories
    : allMemories.filter((m) => m.kind === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="glass p-6 animate-enter">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Heart className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Our Memories & Keepsakes
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Never forget her special dates, favorite gift ideas, or milestone memories.
            </p>
          </div>
        </div>
      </section>

      {/* Creation Card */}
      <section className="glass p-6 animate-enter [animation-delay:90ms]">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Record a New Memory or Idea
        </h2>

        {/* Input Bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={title}
            maxLength={120}
            placeholder="e.g. Loved the elderflower perfume at the botanical garden"
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-2xl border border-border/80 bg-card/60 px-4 py-2.5 text-sm"
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto rounded-2xl border border-border/80 bg-card/60 px-3 py-2 text-xs font-medium"
            />
            <Button
              onClick={add}
              disabled={!title.trim()}
              className="rounded-2xl gradient-romance text-primary-foreground shadow-sm px-4 press-spring"
            >
              <Plus className="size-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-3.5 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              data-active={kind === k.id}
              className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 press-spring hover:border-primary/50 hover:text-foreground data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground data-[active=true]:border-transparent data-[active=true]:shadow-sm"
            >
              <span>{k.emoji}</span>
              <span>{k.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Filter Tabs & Memories Grid */}
      <section className="space-y-4 animate-enter [animation-delay:160ms]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilter("all")}
              data-active={filter === "all"}
              className="rounded-xl border border-border/70 px-3 py-1 text-xs font-semibold text-muted-foreground transition-all duration-200 press-spring hover:text-foreground data-[active=true]:bg-card data-[active=true]:text-foreground data-[active=true]:border-primary/50"
            >
              All ({allMemories.length})
            </button>
            {KINDS.map((k) => {
              const count = allMemories.filter((m) => m.kind === k.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setFilter(k.id)}
                  data-active={filter === k.id}
                  className="rounded-xl border border-border/70 px-3 py-1 text-xs font-semibold text-muted-foreground transition-all duration-200 press-spring hover:text-foreground data-[active=true]:bg-card data-[active=true]:text-foreground data-[active=true]:border-primary/50"
                >
                  {k.emoji} {k.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center text-xs text-muted-foreground">
            <Sparkles className="size-6 text-primary mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-foreground">No memories saved yet</p>
            <p className="mt-1">Add her birthday, anniversaries, or sweet gift ideas above.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((m) => {
              const kindConfig = KINDS.find((k) => k.id === m.kind) ?? KINDS[0]!;

              return (
                <div
                  key={m.id}
                  className="glass glass-hover-glow group relative flex items-start justify-between gap-3 p-4.5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                      <span>{kindConfig.emoji}</span>
                      <span>{kindConfig.label}</span>
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-foreground leading-snug">
                      {m.title}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>{format(new Date(`${m.date}T00:00:00`), "EEEE, d MMMM yyyy")}</span>
                    </p>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete memory"
                    onClick={() =>
                      updateProfile((p) => ({
                        ...p,
                        memories: p.memories.filter((x) => x.id !== m.id),
                      }))
                    }
                    className="size-8 shrink-0 rounded-xl text-muted-foreground opacity-60 hover:text-destructive hover:bg-destructive/10 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}