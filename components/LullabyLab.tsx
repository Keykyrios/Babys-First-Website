"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { audio } from "@/lib/audio";
import { usePip } from "./Providers";
import { Win } from "./Shared";

interface Note { id: number; x: number; y: number; g: string; dx: number }
const PADS = [["do", "var(--blush)"], ["re", "var(--butter)"], ["mi", "var(--lilac)"], ["sol", "var(--blush)"], ["la", "var(--butter)"], ["do↑", "var(--lilac)"], ["re↑", "var(--blush)"]] as const;

export function LullabyLab() {
  const { muted, toggleMuted } = usePip();
  const tension = useSyncExternalStore(audio.subscribe, () => audio.tension, () => 0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [bump, setBump] = useState(0);
  let uid = 0;

  const spawn = (idx: number) => {
    const id = Date.now() + Math.random() + uid++;
    const n: Note = { id, x: 40 + Math.random() * 22, y: 14 + Math.random() * 12, g: ["♪", "♫", "✦", "♬"][idx % 4]!, dx: (Math.random() - 0.5) * 80 };
    setNotes((a) => [...a.slice(-10), n]);
    setBump((b) => b + 1);
    window.setTimeout(() => setNotes((a) => a.filter((x) => x.id !== id)), 2700);
  };

  useEffect(() => {
    audio.onNote = (_f, idx) => spawn(idx);
    const onSong = () => audio.wind(0.7);
    window.addEventListener("pip:lullaby", onSong);
    return () => { audio.onNote = null; window.removeEventListener("pip:lullaby", onSong); audio.stopBox(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.round(tension * 100);
  return (
    <Win title="lullaby-lab.html" className="lab">
      <div className="lab__stage" style={{ transform: `scale(${1 + (bump % 2) * 0.006})`, transition: "transform .25s" }}>
        <img className="lab__box" src="/art/musicbox.webp" alt="A pastel music box with a little unicorn on top and a golden winding key" width={1024} height={924} loading="lazy" decoding="async" />
        <button className="lab__key" onClick={() => audio.wind(0.34)} aria-label="Wind the golden key to start the lullaby" data-silent
          style={{ left: "65%", top: "53.5%", width: "9%", height: "11.5%", right: "auto" }} />
        {notes.map((n) => <span key={n.id} className="lab__note" style={{ left: `${n.x}%`, top: `${n.y}%`, "--dx": `${n.dx}px` } as React.CSSProperties} aria-hidden="true">{n.g}</span>)}
      </div>
      <div className="lab__ctl">
        <button className="btn" onClick={() => audio.wind(0.34)} data-silent>Wind the key</button>
        <div style={{ flex: "1 1 180px" }}>
          <div className="meter" role="progressbar" aria-label="Music box spring" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div>
          <small style={{ fontFamily: "var(--font-soft)", color: "var(--cocoa-soft)" }}>{pct === 0 ? "the spring is relaxed. wind me!" : `spring: ${pct}%. the tune slows as it unwinds`}</small>
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <p className="label" style={{ marginBottom: 10 }}>Play your own chimes</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PADS.map(([l, c], i) => (
            <button key={l} data-silent onClick={() => { audio.chime(i); spawn(i); }} aria-label={`Chime ${l}`}
              style={{ fontFamily: "var(--font-soft)", fontWeight: 600, minWidth: 54, height: 54, borderRadius: 16, border: "2px solid var(--cocoa)", background: c, color: "#5c4033", boxShadow: "0 4px 0 var(--cocoa)" }}>{l}</button>
          ))}
        </div>
        {muted && <p className="gb__status" style={{ marginTop: 14 }}>Sound is muted. <button onClick={toggleMuted} style={{ background: "none", border: 0, color: "var(--berry)", textDecoration: "underline", padding: 0, fontWeight: 700 }}>Unmute</button> to hear the box.</p>}
      </div>
    </Win>
  );
}
