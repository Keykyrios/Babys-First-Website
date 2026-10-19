"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePip } from "./Providers";
import { Reveal } from "./Shared";
import { audio } from "@/lib/audio";

const Pip3D = dynamic(() => import("./Pip3D"), { ssr: false });

export function Hold() {
  const { mood, toggleMood } = usePip();
  const boxRef = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [visible, setVisible] = useState(false);
  const [gl, setGl] = useState(true);

  useEffect(() => {
    try { const c = document.createElement("canvas"); if (!(c.getContext("webgl2") || c.getContext("webgl"))) setGl(false); } catch { setGl(false); }
    const el = boxRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) setMount(true); setVisible(!!e?.isIntersecting); }, { rootMargin: "200px" });
    io.observe(el); return () => io.disconnect();
  }, []);

  const wave = () => { window.dispatchEvent(new Event("pip:wave")); audio.giggle(); };

  return (
    <section className="hold section" id="hold" aria-labelledby="hold-h">
      <div className="wrap hold__grid">
        <div>
          <Reveal>
            <p className="label">Boss level · real 3D</p>
            <h2 id="hold-h" className="display h2" style={{ margin: "10px 0 18px" }}>Hold <em>Pip.</em></h2>
            <p className="lede" style={{ color: "#dccadb" }}>A tiny three.js Pip you can spin with your finger. His eyes follow the pointer, his head follows his eyes, and he waves when poked. Lights out makes his night-lights glow brighter.</p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 28 }}>
              <button className="btn" onClick={wave} data-silent>Make Pip wave</button>
              <button className="btn btn--ghost" onClick={toggleMood}>{mood === "night" ? "Lights on" : "Lights out"}</button>
            </div>
          </Reveal>
        </div>
        <div className="hold__canvas" ref={boxRef}>
          {gl && mount ? <Pip3D night={mood === "night"} active={visible} /> : (
            <div className="hold__fallback"><img src="/art/pip-hero.webp" alt="Pip waving from a cloud (3D view unavailable on this device)" width={896} height={1090} loading="lazy" /></div>
          )}
          <div className="hold__tip" aria-hidden="true"><span className="tip-fine">drag to spin · tap to poke</span><span className="tip-coarse">drag sideways to look · tap to poke</span></div>
        </div>
      </div>
    </section>
  );
}
