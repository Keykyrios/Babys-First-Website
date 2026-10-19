"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HalftoneReveal from "./vendor/HalftoneReveal";
import { InView } from "./Shared";
import { StoryArt } from "./StoryArt";
import { audio } from "@/lib/audio";

interface Page { label: string; text: string; art: React.ReactNode }

const PAGES: Page[] = [
  { label: "Page 1", text: "Once, the moon could not sleep. Every night he glowed and glowed, and nobody sang to him.", art: <StoryArt n={1} /> },
  { label: "Page 2", text: "Pip heard him from the rooftops. “Hehe, that's easy,” said Pip. (It was not easy.)", art: <StoryArt n={2} /> },
  { label: "Page 3", text: "So Pip fetched the music box with the golden key. One wind. Two winds. Three winds. Plink.", art: <StoryArt n={3} /> },
  { label: "Page 4", text: "The moon listened. His glow went soft and low, the colour of warm milk.", art: <StoryArt n={4} /> },
  { label: "Page 5", text: "And the moon fell asleep, and the whole neighbourhood did too. The end. Goodnight.", art: <StoryArt n={5} /> },
];

export function Storybook() {
  const total = PAGES.length + 1; // + cover
  const [flipped, setFlipped] = useState(0);
  const start = useRef<number | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const go = useCallback((d: number) => {
    setFlipped((f) => { const n = Math.max(0, Math.min(total - 1, f + d)); if (n !== f) audio.chime(n); return n; });
  }, [total]);

  useEffect(() => {
    const el = bookRef.current; if (!el) return;
    const key = (e: KeyboardEvent) => { if (e.key === "ArrowRight") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } };
    el.addEventListener("keydown", key); return () => el.removeEventListener("keydown", key);
  }, [go]);

  const current = flipped === 0 ? "Cover" : PAGES[flipped - 1]?.label;

  return (
    <div>
      <div className="book" ref={bookRef} tabIndex={0} role="group" aria-roledescription="storybook" aria-label="The Moon Who Forgot His Lullaby. Use left and right arrow keys, the buttons, or swipe to turn pages."
        onPointerDown={(e) => { start.current = e.clientX; }}
        onPointerUp={(e) => { if (start.current === null) return; const dx = e.clientX - start.current; start.current = null; if (dx < -40) go(1); else if (dx > 40) go(-1); }}>
        {/* cover + pages */}
        {[0, ...PAGES.map((_, i) => i + 1)].map((i) => {
          const isFlipped = i < flipped;
          const last = i === total - 1;
          return (
            <div key={i} className={`book__leaf ${isFlipped ? "is-flipped" : ""}`} style={{ zIndex: isFlipped ? i : total - i }}
              onClick={() => { if (!isFlipped && !last) go(1); else if (isFlipped) go(-1); }} aria-hidden={i !== flipped && i !== flipped - 1}>
              <div className="book__face book__cover" style={i === 0 ? undefined : { background: "var(--paper)", display: "flex", color: "var(--cocoa)" }}>
                {i === 0 ? (
                  <>
                    <div className="halftone"><InView style={{ position: "absolute", inset: 0 }} margin="150px"><HalftoneReveal src="/art/pip-portrait.webp" fit="cover" mode="duotone" shape="dot" cellSize={8} inkColor="#ff9fbd" accentColor="#ffd479" paperColor="#2b2147" revealRadius={150} intro /></InView></div>
                    <div className="book__coverlabel">
                      <p>a bedtime story by Pip</p>
                      <h3>The Moon Who Forgot His Lullaby</h3>
                      <p>shine the light with your cursor · tap to open</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="book__art">{PAGES[i - 1]!.art}</div>
                    <div className="book__text"><b>{PAGES[i - 1]!.label}</b>{PAGES[i - 1]!.text}</div>
                  </>
                )}
              </div>
              {!last && <div className="book__face book__face--back" aria-hidden="true">{i === 0 ? "once upon a night…" : "…"}</div>}
            </div>
          );
        })}
      </div>
      <div className="book__ctl">
        <button className="nav__tool" onClick={() => go(-1)} disabled={flipped === 0} aria-label="Previous page" data-silent>←</button>
        <span aria-live="polite" style={{ minWidth: 120, textAlign: "center", fontWeight: 600 }}>{current} · {flipped + 1}/{total}</span>
        <button className="nav__tool" onClick={() => go(1)} disabled={flipped === total - 1} aria-label="Next page" data-silent>→</button>
      </div>
    </div>
  );
}
