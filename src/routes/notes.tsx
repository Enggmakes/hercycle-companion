import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  BookHeart,
  Check,
  Calendar,
  Heart,
  NotebookPen,
  Sparkles,
  Trash2,
} from "lucide-react";
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

const QUICK_PROMPTS = [
  "What comfort food or tea helped today?",
  "What made her smile?",
  "How were her energy levels?",
  "Gift or treat idea noticed:",
];

function NotesPage() {
  const { profile, updateProfile, ready } = useStore();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [text, setText] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStoreNote = profile?.notes?.[date] ?? "";

  // Synchronize local text state when date or remote note content changes
  useEffect(() => {
    setText(currentStoreNote);
  }, [date, currentStoreNote]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  if (!ready) return null;

  const handleTextChange = (val: string) => {
    const clean = val.slice(0, 1000);
    setText(clean);
    setIsSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateProfile((p) => ({
        ...p,
        notes: { ...p.notes, [date]: clean },
      }));
      setIsSaved(true);
    }, 300);
  };

  const appendPrompt = (prompt: string) => {
    const prefix = text.trim() ? `${text.trim()}\n• ` : "• ";
    handleTextChange(`${prefix}${prompt} `);
  };

  const entries = Object.entries(profile.notes ?? {})
    .filter(([, v]) => v && v.trim())
    .sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="glass p-6 animate-enter">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <NotebookPen className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Private Care Journal
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Jot down what comforted {profile.name || "her"}, favorite treats, or how each day went.
            </p>
          </div>
        </div>
      </section>

      {/* Editor Card */}
      <section className="glass relative overflow-hidden p-6 animate-enter [animation-delay:90ms]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Note Date:
            </span>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto rounded-xl border border-border/80 bg-card/60 px-3 py-1 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaved ? (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="size-3.5" /> Saved
              </span>
            ) : (
              <span>Autosaves as you type</span>
            )}
            <span>·</span>
            <span>{text.length}/1000</span>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">
            Ideas:
          </span>
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp}
              type="button"
              onClick={() => appendPrompt(qp)}
              className="rounded-xl border border-border/70 bg-card/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-all duration-200 press-spring hover:border-primary/50 hover:text-foreground"
            >
              + {qp}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <div className="mt-4">
          <Textarea
            rows={5}
            maxLength={1000}
            placeholder={`E.g. ${profile.name || "She"} had a tender morning. Chamomile tea and a warm bath helped. Loved the lavender heating pad.`}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full resize-none rounded-2xl border border-border/80 bg-card/70 p-4 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </section>

      {/* Historical Journal Feed */}
      <section className="glass p-6 animate-enter [animation-delay:160ms]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookHeart className="size-4 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Past Journal Entries
            </h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
              <Sparkles className="size-6 text-primary mx-auto mb-2 opacity-60" />
              <p className="font-medium text-foreground">No notes written yet</p>
              <p className="mt-1">Write your first caring thought or reminder above.</p>
            </div>
          ) : (
            entries.map(([k, v]) => (
              <div
                key={k}
                className="group relative flex items-start justify-between gap-4 rounded-2xl border border-border/80 bg-card/50 p-4.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-primary">
                    {format(new Date(`${k}T00:00:00`), "EEEE, d MMMM yyyy")}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {v}
                  </p>
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
                  className="size-8 shrink-0 rounded-xl text-muted-foreground opacity-60 hover:text-destructive hover:bg-destructive/10 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}