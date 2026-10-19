"use client";

import { useEffect, useRef, useState } from "react";
import { Win } from "./Shared";

const SKILLS = [
  { name: "Lullabies", cm: 92, color: "var(--blush)", note: "hums on key. mostly." },
  { name: "Night-lights", cm: 78, color: "var(--butter)", note: "glow certified" },
  { name: "Rattles & blocks", cm: 61, color: "var(--lilac)", note: "stacks to 4" },
  { name: "Storytelling", cm: 84, color: "var(--blush)", note: "150 words max" },
  { name: "Napping", cm: 100, color: "var(--butter)", note: "off the chart" },
];

export function Growth() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <Win title="growth-chart.html · nursery wall">
      <div className="chart-wrap" ref={ref}>
        <div className="chart" style={{ "--n": SKILLS.length } as React.CSSProperties} role="img" aria-label={SKILLS.map((s) => `${s.name}: ${s.cm} centimetres`).join(". ")}>
          <div className="chart__ruler" aria-hidden="true">{[0, 25, 50, 75, 100].map((n) => <span key={n}>{n}</span>)}</div>
          {SKILLS.map((s, i) => (
            <div className="bar" key={s.name}>
              <div className={`bar__fill ${on ? "is-in" : ""}`} style={{ "--h": `${s.cm * 0.9}%`, "--bar": s.color, transitionDelay: `${i * 140}ms` } as React.CSSProperties}>
                <b>{s.cm} cm</b>
                <i>{s.note}</i>
                {s.cm === 100 && <img src="/art/pip-face-144.webp" alt="" width={56} height={56} style={{ position: "absolute", top: 12, left: "50%", width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--cocoa)", transform: "translateX(-50%)" }} />}
              </div>
              <span className="bar__name">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="gb__status">Measured on the nursery wall in pencil. Heights are in baby centimetres, which are exaggerated.</p>
    </Win>
  );
}
