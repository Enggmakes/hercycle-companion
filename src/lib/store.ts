import { useCallback, useEffect, useState } from "react";
import type { CycleSettings } from "./cycle";

export type MoodId = "happy" | "normal" | "sad" | "cramps" | "irritated" | "tired";

export const MOODS: { id: MoodId; emoji: string; label: string; score: number }[] = [
  { id: "happy", emoji: "😊", label: "Happy", score: 5 },
  { id: "normal", emoji: "😐", label: "Normal", score: 4 },
  { id: "tired", emoji: "😴", label: "Tired", score: 3 },
  { id: "sad", emoji: "😔", label: "Sad", score: 2 },
  { id: "irritated", emoji: "😡", label: "Irritated", score: 2 },
  { id: "cramps", emoji: "😣", label: "Cramps", score: 1 },
];

export type Memory = {
  id: string;
  title: string;
  date: string;
  kind: "anniversary" | "birthday" | "first-date" | "moment" | "gift" | "wishlist";
  note?: string;
};

export type Profile = {
  id: string;
  name: string;
  settings: CycleSettings;
  moods: Record<string, MoodId>;
  notes: Record<string, string>;
  memories: Memory[];
  reminders: Record<string, boolean>;
};

export type AppData = {
  profiles: Profile[];
  activeId: string;
  pin: string | null;
  theme: "light" | "dark";
};

const KEY = "hercycle:data:v1";

export const makeProfile = (name = "My love"): Profile => ({
  id: Math.random().toString(36).slice(2),
  name,
  settings: {
    lastPeriodStart: new Date(Date.now() - 86400000 * 6).toISOString().slice(0, 10),
    cycleLength: 28,
    periodLength: 5,
  },
  moods: {},
  notes: {},
  memories: [],
  reminders: {
    before5: true,
    before2: true,
    periodDay: true,
    ovulation: true,
    fertile: true,
    pms: true,
  },
});

export const defaultData = (): AppData => {
  const p = makeProfile();
  return { profiles: [p], activeId: p.id, pin: null, theme: "light" };
};

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.profiles?.length) return defaultData();
    return parsed;
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

/** Client-only store hook. `ready` is false until localStorage is read. */
export function useAppData() {
  const [data, setData] = useState<AppData>(defaultData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveData(data);
    document.documentElement.classList.toggle("dark", data.theme === "dark");
  }, [data, ready]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  const profile: Profile =
    data.profiles.find((p) => p.id === data.activeId) ?? data.profiles[0]!;

  const updateProfile = useCallback(
    (fn: (p: Profile) => Profile) =>
      setData((d) => ({
        ...d,
        profiles: d.profiles.map((p) => (p.id === d.activeId ? fn(p) : p)),
      })),
    [],
  );

  return { data, setData, update, updateProfile, profile, ready };
}