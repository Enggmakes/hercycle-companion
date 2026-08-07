import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { useAppData } from "./store";

type Store = ReturnType<typeof useAppData>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // AuthGate normally guarantees a user; keep local mode safe during auth transitions.
  const store = useAppData(user?.uid ?? "local");
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}