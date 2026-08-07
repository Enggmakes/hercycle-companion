import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(
    isFirebaseConfigured ? null : LOCAL_USER,
  );
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [signOutFn, setSignOutFn] = useState<() => Promise<void>>(
    () => async () => {},
  );

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
