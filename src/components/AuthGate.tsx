import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Flower2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginPage } from "./LoginPage";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="grid size-16 place-items-center rounded-3xl gradient-romance shadow-lg"
      >
        <Flower2 className="size-8 text-primary-foreground" />
      </motion.span>
      <p className="text-sm text-muted-foreground">Loading HerCycle…</p>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoginPage />;
  return <>{children}</>;
}
