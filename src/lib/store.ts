import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CycleSettings } from "./cycle";
import { firebaseConfig, isFirebaseConfigured } from "./firebase";

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

export const DEFAULT_PROFILE_ID = "default_profile";

export const makeProfile = (name = "My love", id = DEFAULT_PROFILE_ID): Profile => ({
  id,
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
  const p = makeProfile("My love", DEFAULT_PROFILE_ID);
  return { profiles: [p], activeId: DEFAULT_PROFILE_ID, pin: null, theme: "light" };
};

/**
 * Firebase strips empty arrays and objects from stored data.
 * This fills in missing fields so components never get `undefined`.
 */
export function sanitizeProfile(raw: Partial<Profile>, index = 0): Profile {
  const defaultId = index === 0 ? DEFAULT_PROFILE_ID : `profile_${index}`;
  const base = makeProfile(raw.name ?? "My love", raw.id ?? defaultId);
  return {
    ...base,
    ...raw,
    id: raw.id ?? base.id,
    name: raw.name ?? base.name,
    settings: raw.settings ? { ...base.settings, ...raw.settings } : base.settings,
    moods: raw.moods && typeof raw.moods === "object" ? raw.moods : {},
    notes: raw.notes && typeof raw.notes === "object" ? raw.notes : {},
    memories: Array.isArray(raw.memories)
      ? raw.memories
      : raw.memories && typeof raw.memories === "object"
        ? (Object.values(raw.memories) as Memory[])
        : [],
    reminders: raw.reminders ? { ...base.reminders, ...raw.reminders } : base.reminders,
  };
}

export function sanitizeAppData(raw: Partial<AppData> | null | undefined): AppData {
  if (!raw || typeof raw !== "object") return defaultData();

  const rawProfiles = Array.isArray(raw.profiles)
    ? raw.profiles
    : raw.profiles && typeof raw.profiles === "object"
      ? Object.values(raw.profiles)
      : [];

  const profiles =
    rawProfiles.length > 0
      ? (rawProfiles as Partial<Profile>[]).map((p, idx) => sanitizeProfile(p, idx))
      : defaultData().profiles;

  return {
    profiles,
    activeId: raw.activeId ?? profiles[0]?.id ?? DEFAULT_PROFILE_ID,
    pin: raw.pin ?? null,
    theme: raw.theme === "dark" ? "dark" : "light",
  };
}

// ─── Local storage fallback ──────────────────────────────────────────────────

const STORAGE_KEY = "hercycle_app_data";

export function loadLocalData(): AppData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return sanitizeAppData(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return defaultData();
}

export function saveLocalData(d: AppData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

// ─── DB path per user ────────────────────────────────────────────────────────

const dbPath = (uid: string) => `users/${uid}/appData`;

// ─── Main store hook ─────────────────────────────────────────────────────────

/**
 * App store backed by Firebase Realtime Database with local storage caching.
 * Data is stored privately per user at `users/{uid}/appData`.
 */
export function useAppData(uid: string) {
  const [data, setData] = useState<AppData>(loadLocalData);
  const [ready] = useState(true);

  const dataRef = useRef(data);
  dataRef.current = data;

  const lastWrittenJsonRef = useRef<string>("");
  const skipWrite = useRef(false);
  const writeRef = useRef<((d: AppData) => void) | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync to localStorage ──────────────────────────────────────────────────
  useEffect(() => {
    saveLocalData(data);
  }, [data]);

  // ── Subscribe to Firebase on mount (or when uid changes) ─────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !uid || !isFirebaseConfigured) return;

    let unsubscribe: (() => void) | null = null;
    let active = true;

    // Reset to defaults immediately when the user changes
    const initial = defaultData();
    setData(initial);
    dataRef.current = initial;
    lastWrittenJsonRef.current = JSON.stringify(initial);

    Promise.all([
      import("firebase/app"),
      import("firebase/database"),
    ]).then(([{ initializeApp, getApps, getApp }, { getDatabase, ref, onValue, set }]) => {
      if (!active) return;

      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const db = getDatabase(app);
      const path = dbPath(uid);

      writeRef.current = (d: AppData) => {
        const json = JSON.stringify(d);
        lastWrittenJsonRef.current = json;
        set(ref(db, path), d).catch((err) =>
          console.warn("[HerCycle] Firebase write failed:", err),
        );
      };

      unsubscribe = onValue(
        ref(db, path),
        (snapshot) => {
          if (!active) return;
          const val = snapshot.val();

          if (val) {
            const sanitized = sanitizeAppData(val);
            const sanitizedJson = JSON.stringify(sanitized);

            // Skip updating state if the remote snapshot matches what we currently have or last wrote
            if (
              sanitizedJson !== JSON.stringify(dataRef.current) &&
              sanitizedJson !== lastWrittenJsonRef.current
            ) {
              skipWrite.current = true;
              setData(sanitized);
            }
          } else {
            // New user — seed initial default data once
            const seeded = defaultData();
            skipWrite.current = true;
            setData(seeded);
            writeRef.current?.(seeded);
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

  // ── Write to Firebase on local changes (Debounced 500ms) ──────────────────
  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      writeRef.current?.(data);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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
    data.profiles.find((p) => p.id === data.activeId) ?? data.profiles[0] ?? defaultData().profiles[0]!;

  return useMemo(
    () => ({ data, setData, update, updateProfile, profile, ready }),
    [data, update, updateProfile, profile, ready],
  );
}