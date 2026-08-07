import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { firebaseConfig, isFirebaseConfigured } from "./firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthCtx = {
  user: AuthUser | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
  localMode: boolean;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const LOCAL_USER: AuthUser = {
  uid: "local",
  email: null,
  displayName: "My love",
  photoURL: null,
};

const PIN_LOCK_INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes
const SIGNOUT_INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(
    isFirebaseConfigured ? null : LOCAL_USER,
  );
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [signOutFn, setSignOutFn] = useState<() => Promise<void>>(
    () => async () => {},
  );

  const lastActiveRef = useRef<number>(Date.now());

  // ── Track User Activity for Inactivity Timers ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateActivity = () => {
      lastActiveRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    // Check inactivity every 10 seconds
    const interval = setInterval(() => {
      if (!user) return;

      const idleMs = Date.now() - lastActiveRef.current;

      // 30 minutes idle -> Auto Sign Out
      if (idleMs >= SIGNOUT_INACTIVITY_MS) {
        console.warn("[HerCycle] Auto signing out due to 30 minutes of inactivity.");
        void signOutFn();
      }
      // 10 minutes idle -> Lock PIN Screen
      else if (idleMs >= PIN_LOCK_INACTIVITY_MS) {
        window.dispatchEvent(new CustomEvent("hercycle:pin-lock"));
      }
    }, 10_000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(interval);
    };
  }, [user, signOutFn]);

  useEffect(() => {
    if (typeof window === "undefined" || !isFirebaseConfigured) return;

    let unsubscribe: (() => void) | null = null;

    Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ]).then(([{ initializeApp, getApps, getApp }, { getAuth, onAuthStateChanged, signOut }]) => {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);

      // Expose sign-out so the rest of the app can call it
      setSignOutFn(() => () => signOut(auth));

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });
    }).catch((err) => {
      console.error("[HerCycle] Auth init error:", err);
      setAuthLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, authLoading, signOut: signOutFn, localMode: !isFirebaseConfigured }),
    [user, authLoading, signOutFn],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
