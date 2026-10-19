"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePip } from "./Providers";
import { audio } from "@/lib/audio";

// geometry of the official avatar render (896 × 1090 px)
const W = 896, H = 1090;
const EYES = [
  { c: [375, 435], rest: [393, 441] },  // left socket centre, baked glow position
  { c: [542, 388], rest: [524.1, 409.4] },  // right socket
] as const;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function Hero() {
  const { hello, mood, setMood, updateMemory, toast } = usePip();
  const stageRef = useRef<HTMLDivElement>(null);
  const dots = useRef<Array<HTMLSpanElement | null>>([null, null]);
  const look = useRef({ x: 0, y: 0, active: false, last: 0 });
  const [asleep, setAsleep] = useState(false);
  const taps = useRef<number[]>([]);
  const [wink, setWink] = useState(false);

  // eyes follow the pointer (or wander when nobody is moving). rAF + refs, no re-renders.
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (e: PointerEvent) => { look.current = { x: e.clientX, y: e.clientY, active: true, last: performance.now() }; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    let raf = 0; const ease = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
    const frame = (t: number) => {
      const stage = stageRef.current;
      if (stage && !calm) {
        const r = stage.getBoundingClientRect();
        const k = r.width / W;
        const idle = !look.current.active || t - look.current.last > 3200;
        EYES.forEach((eye, i) => {
          let tx = 0, ty = 0;
          if (idle) { tx = Math.sin(t / 1700 + i * 0.4) * 0.55; ty = Math.cos(t / 2300) * 0.35; }
          else {
            const cx = r.left + eye.c[0] * k, cy = r.top + eye.c[1] * k;
            const dx = look.current.x - cx, dy = look.current.y - cy;
            const d = Math.hypot(dx, dy) || 1;
            const m = Math.min(d / 260, 1);
            tx = (dx / d) * m; ty = (dy / d) * m;
          }
          ease[i]!.x += (tx - ease[i]!.x) * 0.12; ease[i]!.y += (ty - ease[i]!.y) * 0.12;
          const el = dots.current[i]; if (!el) return;
          const R = 21; // px travel inside the socket, in render pixels
          const x = eye.c[0] + ease[i]!.x * R + (1 - Math.hypot(ease[i]!.x, ease[i]!.y)) * (eye.rest[0] - eye.c[0]) * 0.55;
          const y = eye.c[1] + ease[i]!.y * R + (1 - Math.hypot(ease[i]!.x, ease[i]!.y)) * (eye.rest[1] - eye.c[1]) * 0.55;
          el.style.left = pct(x, W); el.style.top = pct(y, H);
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onMove); };
  }, []);

  // ★ EASTER EGG: tickle the moon three times
  const tickle = useCallback(async () => {
    const now = performance.now();
    taps.current = [...taps.current.filter((t) => now - t < 2400), now];
    audio.chime(taps.current.length * 2);
    setWink(true); window.setTimeout(() => setWink(false), 500);
    if (taps.current.length < 3) return;
    taps.current = [];
    setAsleep(true); setMood("night"); updateMemory({ foundMoon: true });
    toast("You tickled the sleepy moon. Pip is dozing off…");
    audio.goodnight();
    const { default: confetti } = await import("canvas-confetti");
    const star = confetti.shapeFromText ? confetti.shapeFromText({ text: "★", scalar: 2 }) : "star";
    const base = { spread: 80, ticks: 220, gravity: 0.6, scalar: 1.6, shapes: [star as never], colors: ["#ffd479", "#ff9fbd", "#b7a2ff", "#fff3c9"], origin: { y: 0.45 } };
    confetti({ ...base, particleCount: 60, angle: 60, origin: { x: 0.2, y: 0.5 } });
    confetti({ ...base, particleCount: 60, angle: 120, origin: { x: 0.8, y: 0.5 } });
    window.setTimeout(() => { setAsleep(false); audio.giggle(); }, 5200);
  }, [setMood, toast, updateMemory]);

  return (
    <section className="hero" id="top">
      <div className="wrap hero__grid">
        <div>
          <div className="hero__kicker">
            <span className="sticker" style={{ "--rot": "-3deg" } as React.CSSProperties}>Junior Dream Engineer</span>
            <span className="sticker" style={{ "--rot": "2deg", background: "var(--lilac)" } as React.CSSProperties}>Midnight Nursery</span>
          </div>
          <h1 className="display hero__title">
            <span>I build the</span>
            <span><em>dreams</em> you</span>
            <span>fall asleep</span>
            <span>inside.</span>
          </h1>
          <p className="hero__greet" aria-live="polite">{hello}</p>
          <p className="lede">Hi, I&apos;m Pip. A baby with a skull face, a nightcap and a very small job: making sure the neighbourhood&apos;s little ghosts and creatures fall asleep happy.</p>
          <div className="hero__cta">
            <a className="btn" href="#meet">Meet the baby</a>
            <a className="btn btn--ghost" href="#wishes">Leave a wish</a>
          </div>
          <div className="scroll-cue" aria-hidden="true"><i /> scroll for the bedtime story</div>
        </div>

        <div className="hero__stage" ref={stageRef}>
          <div className="arch hero__arch">
            <img src="/art/pip-hero-clean.webp" alt="Pip, a baby with a smooth round skull face and a starry nightcap, sitting on a soft cloud and waving." width={W} height={H} fetchPriority="high" decoding="async" />
            <div className="hero__eyes" aria-hidden="true">
              {EYES.map((eye, i) => (
                <span key={i}>
                  <span className="eye__dot" ref={(el) => { dots.current[i] = el; }}
                    style={{ left: pct(eye.rest[0], W), top: pct(eye.rest[1], H), width: pct(asleep ? 24 : 20, W), height: asleep ? "0.45%" : undefined, aspectRatio: asleep ? undefined : "1", borderRadius: asleep ? "6px" : "50%" }} />
                </span>
              ))}
            </div>
          </div>
          <button className="hero__moon" onClick={tickle} aria-label="The sleepy moon. Tickle it three times to find a secret." title="psst… tickle me" data-silent
            style={{ left: "69.2%", top: "8.7%", right: "auto", width: "17.3%", transform: wink ? "scale(1.16) rotate(8deg)" : undefined, transition: "transform .25s" }}>
            <img src="/art/moon.png" alt="" width={155} height={195} />
          </button>
          <img className="hero__star" src="/art/star-gold.png" alt="" width={46} height={46} style={{ left: "-7%", top: "26%", width: "9%", animationDelay: "0s" }} />
          <img className="hero__star" src="/art/star-lav.png" alt="" width={46} height={46} style={{ right: "-6%", top: "52%", width: "8%", animationDelay: "1.2s" }} />
          <img className="hero__star" src="/art/star-gold2.png" alt="" width={46} height={46} style={{ left: "-4%", bottom: "12%", width: "7%", animationDelay: "2.1s" }} />
          {["z", "Z", "z"].map((z, i) => <span className="zzz" key={i} style={{ left: `${70 + i * 5}%`, top: `${20 + i * -2}%`, fontSize: `${1.2 + i * 0.5}rem`, animationDelay: `${i * 1.3}s` }} aria-hidden="true">{z}</span>)}
        </div>
      </div>
    </section>
  );
}
