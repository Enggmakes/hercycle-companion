import { useCallback, useEffect, useRef, useState } from "react";
import type { CycleSettings } from "./cycle";
import { firebaseConfig } from "./firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/**
 * Firebase strips empty arrays and objects from stored data.
 * This fills in missing fields so components never get `undefined`.
 */
export function sanitizeProfile(raw: Partial<Profile>): Profile {
  const base = makeProfile(raw.name ?? "My love");
  return {
    ...base,
    ...raw,
    id: raw.id ?? base.id,
    name: raw.name ?? base.name,
    settings: raw.settings ?? base.settings,
    moods: raw.moods ?? {},
    notes: raw.notes ?? {},
    memories: Array.isArray(raw.memories) ? raw.memories : [],
    reminders: raw.reminders ?? base.reminders,
  };
}

export function sanitizeAppData(raw: Partial<AppData>): AppData {
  const def = defaultData();
  const profiles =
    Array.isArray(raw.profiles) && raw.profiles.length
      ? (raw.profiles as Partial<Profile>[]).map(sanitizeProfile)
      : def.profiles;
  return {
    profiles,
    activeId: raw.activeId ?? profiles[0]!.id,
    pin: raw.pin ?? null,
    theme: raw.theme ?? "light",
  };
}

// ─── DB path per user ────────────────────────────────────────────────────────

const dbPath = (uid: string) => `users/${uid}/appData`;

// ─── Main store hook ─────────────────────────────────────────────────────────

/**
 * App store backed by Firebase Realtime Database.
 * Data is stored privately per user at `users/{uid}/appData`.
 * Pass the authenticated user's `uid`; pass `null` to skip Firebase (should not happen).
 */
export function useAppData(uid: string) {
  const [data, setData] = useState<AppData>(defaultData);

  // Always ready — UI renders immediately with defaults, Firebase updates later
  const [ready] = useState(true);

  const skipWrite = useRef(false);
  const writeRef = useRef<((d: AppData) => void) | null>(null);

  // ── Subscribe to Firebase on mount (or when uid changes) ─────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !uid) return;

    let unsubscribe: (() => void) | null = null;
    let active = true;

    // Reset to defaults immediately when the user changes
    setData(defaultData());

    Promise.all([
      import("firebase/app"),
      import("firebase/database"),
    ]).then(([{ initializeApp, getApps, getApp }, { getDatabase, ref, onValue, set }]) => {
      if (!active) return;

      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const db = getDatabase(app);
      const path = dbPath(uid);

      writeRef.current = (d: AppData) => {
        set(ref(db, path), d).catch((err) =>
          console.warn("[HerCycle] Firebase write failed:", err),
        );
      };

      unsubscribe = onValue(
        ref(db, path),
        (snapshot) => {
          if (!active) return;
          const val = snapshot.val() as AppData | null;

          if (val && val.profiles?.length) {
            skipWrite.current = true;
            setData(sanitizeAppData(val));
          } else if (val === null) {
            // New user — seed their data
            writeRef.current?.(defaultData());
          }
        },
        (error) => {
          console.warn("[HerCycle] Firebase read error:", error.message);
        },
      );
    }).catch((err) => {
      console.warn("[HerCycle] Firebase unavailable:", err);
    });

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [uid]);

  // ── Sync theme ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.theme === "dark");
  }, [data.theme]);

  // ── Write to Firebase on local changes ────────────────────────────────────
  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    writeRef.current?.(data);
  }, [data]);

  // ─── Updaters ─────────────────────────────────────────────────────────────

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((d) => fn(d));
  }, []);

  const updateProfile = useCallback((fn: (p: Profile) => Profile) => {
    setData((d) => ({
      ...d,
      profiles: d.profiles.map((p) => (p.id === d.activeId ? fn(p) : p)),
    }));
  }, []);

  const profile: Profile =
    data.profiles.find((p) => p.id === data.activeId) ?? data.profiles[0]!;

  return { data, setData, update, updateProfile, profile, ready };
}