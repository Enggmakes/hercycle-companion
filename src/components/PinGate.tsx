import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Heart, LockKeyhole } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PinGate({ children }: { children: ReactNode }) {
  const { data, ready } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ready && !data.pin) setUnlocked(true);

    const handleLock = () => {
      if (data.pin) setUnlocked(false);
    };

    window.addEventListener("hercycle:pin-lock", handleLock);
    return () => window.removeEventListener("hercycle:pin-lock", handleLock);
  }, [ready, data.pin]);

  if (!ready) return null;
  if (!data.pin || unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-sm p-8 text-center"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-3xl gradient-romance">
          <LockKeyhole className="size-6 text-primary-foreground" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold">Locked with love</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your PIN to open HerCycle.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (value === data.pin) setUnlocked(true);
            else {
              setError(true);
              setValue("");
            }
          }}
        >
          <Input
            autoFocus
            inputMode="numeric"
            type="password"
            maxLength={8}
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/\D/g, ""));
              setError(false);
            }}
            className="text-center text-2xl tracking-[0.5em]"
            placeholder="••••"
          />
          {error && <p className="text-sm text-destructive">That PIN doesn't match.</p>}
          <Button type="submit" className="w-full">
            <Heart className="size-4" /> Unlock
          </Button>
        </form>
      </motion.div>
    </div>
  );
}