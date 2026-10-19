"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { audio } from "@/lib/audio";
import { greeting, usePipMemory, type Memory, type Visit } from "@/lib/memory";

type Mood = "day" | "night";

interface Ctx {
  mood: Mood;
  setMood: (m: Mood) => void;
  toggleMood: () => void;
  muted: boolean;
  toggleMuted: () => void;
  memory: Memory | null;
  visit: Visit | null;
  hello: string;
  updateMemory: (p: Partial<Memory>) => void;
  toast: (t: string) => void;
}

const PipCtx = createContext<Ctx | null>(null);
export const usePip = () => {
  const c = useContext(PipCtx);
  if (!c) throw new Error("usePip outside provider");
  return c;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [mood, setMoodState] = useState<Mood>("day");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const { visit, update } = usePipMemory();
  const muted = useSyncExternalStore(audio.subscribe, () => audio.muted, () => false);

  // pick up whatever the pre-paint script chose
  useEffect(() => {
    const m = document.documentElement.dataset.mood === "night" ? "night" : "day";
    setMoodState(m);
  }, []);

  const setMood = useCallback((m: Mood) => {
    document.documentElement.dataset.mood = m;
    try { localStorage.setItem("pip-mood-v1", m); } catch { /* ignore */ }
    setMoodState(m);
  }, []);
  const toggleMood = useCallback(() => {
    setMood(document.documentElement.dataset.mood === "night" ? "day" : "night");
  }, [setMood]);

  const toast = useCallback((t: string) => {
    setToastMsg(t);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 3600);
  }, []);

  // soft click sound on every button / link press (mute-aware)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("button, a, [role=button]");
      if (el && !el.hasAttribute("data-silent")) audio.click();
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const hello = useMemo(() => greeting(visit, new Date().getHours()), [visit]);

  const value: Ctx = {
    mood, setMood, toggleMood, muted,
    toggleMuted: () => audio.setMuted(!audio.muted),
    memory: visit?.memory ?? null, visit, hello, updateMemory: update, toast,
  };

  return (
    <PipCtx.Provider value={value}>
      {children}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </PipCtx.Provider>
  );
}
