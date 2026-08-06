import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Gem, Plus, Trash2 } from "lucide-react";
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

const KINDS: { id: Memory["kind"]; label: string }[] = [
  { id: "anniversary", label: "Anniversary" },
  { id: "birthday", label: "Birthday" },
  { id: "first-date", label: "First date" },
  { id: "moment", label: "Special moment" },
  { id: "gift", label: "Gift idea" },
  { id: "wishlist", label: "Wishlist" },
];

function MemoriesPage() {
  const { profile, updateProfile, ready } = useStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [kind, setKind] = useState<Memory["kind"]>("moment");
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

  return (
    <div className="space-y-5">
      <section className="glass p-5">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Gem className="size-5 text-primary" /> Us
        </h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <Input
            value={title}
            maxLength={120}
            placeholder="Our first date at the pier"
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button onClick={add}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              data-active={kind === k.id}
              className="rounded-full border border-border px-3 py-1 text-xs transition-colors data-[active=true]:gradient-romance data-[active=true]:text-primary-foreground"
            >
              {k.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {(profile.memories ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing saved yet — start with her birthday.
          </p>
        )}
        {[...(profile.memories ?? [])]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((m) => (
            <div
              key={m.id}
              className="glass grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-4"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary uppercase">
                  {KINDS.find((k) => k.id === m.kind)?.label}
                </p>
                <p className="truncate font-semibold">{m.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(`${m.date}T00:00:00`), "d MMM yyyy")}
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
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
      </section>
    </div>
  );
}