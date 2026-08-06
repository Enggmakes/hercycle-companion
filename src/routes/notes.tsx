import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { NotebookPen, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Private Notes — HerCycle ❤️" },
      {
        name: "description",
        content: "Keep private day-by-day notes about how she felt and what helped.",
      },
      { property: "og:title", content: "Private Notes — HerCycle ❤️" },
      {
        property: "og:description",
        content: "Day-by-day private notes, stored only on this device.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { profile, updateProfile, ready } = useStore();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  if (!ready) return null;

  const entries = Object.entries(profile.notes ?? {}).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="space-y-5">
      <section className="glass p-5">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <NotebookPen className="size-5 text-primary" /> Notes
        </h1>
        <div className="mt-4 grid gap-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Textarea
            rows={4}
            maxLength={1000}
            placeholder="She had severe cramps. Bought flowers. Favorite food: pizza."
            value={profile.notes[date] ?? ""}
            onChange={(e) =>
              updateProfile((p) => ({
                ...p,
                notes: { ...p.notes, [date]: e.target.value.slice(0, 1000) },
              }))
            }
          />
          <p className="text-xs text-muted-foreground">Saved automatically on this device.</p>
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="text-lg font-semibold">Journal</h2>
        <div className="mt-3 space-y-2">
          {entries.filter(([, v]) => v.trim()).length === 0 && (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          )}
          {entries
            .filter(([, v]) => v.trim())
            .map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary">
                    {format(new Date(`${k}T00:00:00`), "EEEE, d MMM yyyy")}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{v}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete note"
                  onClick={() =>
                    updateProfile((p) => {
                      const notes = { ...p.notes };
                      delete notes[k];
                      return { ...p, notes };
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}