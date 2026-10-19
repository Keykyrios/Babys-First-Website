"use client";

import { useCallback, useEffect, useState } from "react";

/** What Pip remembers about a returning visitor — localStorage only, never leaves the browser. */
export interface Memory {
  name: string;
  visits: number;
  first: number;
  last: number;
  wishes: number;
  foundMoon: boolean;
}

const KEY = "pip-memory-v1";
const blank = (): Memory => ({ name: "", visits: 0, first: 0, last: 0, wishes: 0, foundMoon: false });

function read(): Memory {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...blank(), ...(JSON.parse(raw) as Partial<Memory>) } : blank();
  } catch { return blank(); }
}
function write(m: Memory) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ } }

export interface Visit { memory: Memory; prevLast: number; isReturn: boolean }

export function usePipMemory() {
  const [visit, setVisit] = useState<Visit | null>(null);

  useEffect(() => {
    const m = read();
    const prevLast = m.last;
    const isReturn = m.visits > 0;
    const next = { ...m, visits: m.visits + 1, first: m.first || Date.now(), last: Date.now() };
    write(next);
    setVisit({ memory: next, prevLast, isReturn });
  }, []);

  const update = useCallback((patch: Partial<Memory>) => {
    setVisit((v) => {
      const base = v?.memory ?? read();
      const next = { ...base, ...patch };
      write(next);
      return v ? { ...v, memory: next } : { memory: next, prevLast: 0, isReturn: false };
    });
  }, []);

  return { visit, update };
}

function ago(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 2) return "just a moment ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/** Pip's hello. Different for first-timers, returners, and named friends. */
export function greeting(v: Visit | null, hour: number): string {
  const tod = hour >= 5 && hour < 12 ? "good morning" : hour < 17 && hour >= 12 ? "good afternoon" : hour >= 17 && hour < 22 ? "good evening" : "it's very late";
  if (!v) return "hi hi hi! i'm Pip. come in, mind the clouds.";
  const { memory: m, isReturn, prevLast } = v;
  const who = m.name ? `, ${m.name}` : "";
  if (!isReturn) return `${tod}${who}! i'm Pip. i build the dreams. want to see?`;
  const since = ago(Date.now() - prevLast);
  const nth = m.visits === 2 ? "second" : m.visits === 3 ? "third" : `${m.visits}th`;
  const extra = m.wishes > 0 ? " your wish is still on the wall, i checked." : m.foundMoon ? " the moon says hi (he remembers you)." : " you came back! hehe.";
  return `welcome back${who}! this is your ${nth} visit. last time was ${since}.${extra}`;
}
