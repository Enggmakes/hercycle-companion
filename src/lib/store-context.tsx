import { createContext, useContext, type ReactNode } from "react";
import { useAppData } from "./store";

type Store = ReturnType<typeof useAppData>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useAppData();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}