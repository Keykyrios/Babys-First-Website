"use client";

import { useEffect } from "react";
import { usePip } from "./Providers";

/**
 * Sparkle cursor trail from the `cursor-effects` library (character trail of
 * pastel stars). Fine pointers only, and never under reduced motion.
 */
export function CursorTrail() {
  const { mood } = usePip();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    let fx: { destroy(): void } | null = null;
    let dead = false;
    import("cursor-effects").then(({ characterCursor }) => {
      if (dead) return;
      const colors = mood === "night" ? ["#ffd479", "#ff9fbd", "#b7a2ff"] : ["#e9a3b8", "#e3b85c", "#b8a2dd"];
      fx = characterCursor({ characters: ["✦", "·"], colors, font: "11px 'Fredoka Variable', sans-serif" });
    }).catch(() => {});
    return () => { dead = true; fx?.destroy(); };
  }, [mood]);
  return null;
}
