import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { useAppData } from "./store";

type Store = ReturnType<typeof useAppData>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // uid is always a non-empty string here because AuthGate ensures we're logged in
  const store = useAppData(user!.uid);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}