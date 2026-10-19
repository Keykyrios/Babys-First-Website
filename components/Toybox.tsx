"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { Win } from "./Shared";
import { audio } from "@/lib/audio";

type Kind = "block" | "star" | "moon" | "ball";
interface Meta { kind: Kind; letter?: string; color: string; sprite?: number; size: number }

const COLORS = ["#f4b8c6", "#f7dc8f", "#cdbbe9", "#fbdde4", "#e9a3b8"];
const SPRITES = ["/art/star-gold.png", "/art/star-lav.png", "/art/star-gold2.png", "/art/star-lav2.png", "/art/moon.png"];
const INK = "#5c4033";

/** a small physics playpen: alphabet blocks, stars, a moon and balls. canvas 2D + matter-js */
export function Toybox() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ spawn: (x?: number, y?: number) => void; reset: () => void } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current, cv = canvas.current; if (!el || !cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const { Engine, Bodies, Body, Composite, Events, Query, Constraint } = Matter;
    const engine = Engine.create({ gravity: { x: 0, y: 1.1, scale: 0.0011 } });
    const world = engine.world;
    const imgs: HTMLImageElement[] = SPRITES.map((s) => { const i = new Image(); i.src = s; return i; });
    let W = 0, H = 0, dpr = 1, visible = false, raf = 0, last = 0;
    let walls: Matter.Body[] = [];
    let drag: { c: Matter.Constraint; anchor: { x: number; y: number } } | null = null;
    let lastChime = 0;
    const metaOf = (b: Matter.Body) => (b as unknown as { meta?: Meta }).meta;
    const small = () => W < 520;
    const u = () => (small() ? 0.78 : 1);

    const make = (x: number, y: number, kind: Kind, letter?: string): Matter.Body => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]!;
      let b: Matter.Body, size: number, sprite: number | undefined;
      if (kind === "block") { size = 64 * u(); b = Bodies.rectangle(x, y, size, size, { chamfer: { radius: 12 }, restitution: 0.35, friction: 0.5, density: 0.0016 }); }
      else if (kind === "moon") { size = 92 * u(); sprite = 4; b = Bodies.circle(x, y, size * 0.4, { restitution: 0.5, density: 0.0012 }); }
      else if (kind === "star") { size = 56 * u(); sprite = Math.floor(Math.random() * 4); b = Bodies.circle(x, y, size * 0.38, { restitution: 0.55, density: 0.001 }); }
      else { size = (30 + Math.random() * 20) * u(); b = Bodies.circle(x, y, size / 2, { restitution: 0.75, density: 0.0009 }); }
      Body.setAngle(b, (Math.random() - 0.5) * 0.8);
      (b as unknown as { meta: Meta }).meta = { kind, letter, color, sprite, size };
      Composite.add(world, b); return b;
    };

    const populate = () => {
      Composite.allBodies(world).forEach((b) => { if (metaOf(b)) Composite.remove(world, b); });
      const cx = W / 2;
      ["P", "I", "P"].forEach((l, i) => window.setTimeout(() => make(cx + (i - 1) * 76 * u(), -40, "block", l), i * 140));
      ["Z", "♥", "Z"].forEach((l, i) => window.setTimeout(() => make(cx + (i - 1) * 90 * u() + 30, -120, "block", l), 450 + i * 150));
      window.setTimeout(() => make(cx - 150 * u(), -60, "moon"), 500);
      window.setTimeout(() => make(cx + 170 * u(), -60, "moon"), 900);
      for (let i = 0; i < 9; i++) window.setTimeout(() => make(50 + Math.random() * (W - 100), -30 - i * 20, "star"), 650 + i * 110);
      for (let i = 0; i < 11; i++) window.setTimeout(() => make(50 + Math.random() * (W - 100), -30, "ball"), 1300 + i * 90);
    };

    const build = () => {
      const r = el.getBoundingClientRect(); W = Math.max(240, r.width); H = Math.max(280, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      Composite.remove(world, walls);
      const t = 80, o = { isStatic: true, friction: 0.6, restitution: 0.2 };
      walls = [Bodies.rectangle(W / 2, H + t / 2 - 6, W + 400, t, o), Bodies.rectangle(-t / 2 + 4, H / 2 - 400, t, H * 3, o), Bodies.rectangle(W + t / 2 - 4, H / 2 - 400, t, H * 3, o)];
      Composite.add(world, walls);
      // keep anything that ended up outside after a resize
      Composite.allBodies(world).forEach((b) => { if (metaOf(b) && (b.position.x > W || b.position.y > H)) Body.setPosition(b, { x: Math.min(b.position.x, W - 40), y: Math.min(b.position.y, H - 60) }); });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // soft floor shadow line
      ctx.fillStyle = "rgba(92,64,51,.07)"; ctx.fillRect(0, H - 8, W, 8);
      for (const b of Composite.allBodies(world)) {
        const m = metaOf(b); if (!m) continue;
        ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle);
        if (m.kind === "block") {
          const s = m.size; ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2 + 4, s, s, 14); ctx.fill();
          ctx.fillStyle = m.color; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, 14); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.roundRect(-s / 2 + 6, -s / 2 + 6, s - 12, 8, 4); ctx.fill();
          ctx.fillStyle = INK; ctx.font = `600 ${s * 0.52}px "Fredoka Variable", system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(m.letter ?? "", 0, 3);
        } else if (m.kind === "ball") {
          const r = m.size / 2; ctx.fillStyle = m.color; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.35, r * 0.22, 0, 7); ctx.fill();
        } else {
          const im = imgs[m.sprite ?? 0]!; if (im.complete && im.naturalWidth) { const w = m.size, hgt = m.size * (im.naturalHeight / im.naturalWidth); ctx.drawImage(im, -w / 2, -hgt / 2, w, hgt); }
        }
        ctx.restore();
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min(33, t - last || 16); last = t;
      if (drag) { drag.c.pointA = drag.anchor; }
      Engine.update(engine, dt); draw();
    };

    Events.on(engine, "collisionStart", (e) => {
      const now = performance.now(); if (now - lastChime < 110) return;
      let hit = 0; for (const p of e.pairs) { const v = Math.abs(p.bodyA.speed - p.bodyB.speed) + Math.max(p.bodyA.speed, p.bodyB.speed); hit = Math.max(hit, v); }
      if (hit > 4.5) { lastChime = now; audio.chime(Math.floor(Math.random() * 7)); }
    });

    const pt = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const down = (e: PointerEvent) => {
      const p = pt(e); const hit = Query.point(Composite.allBodies(world).filter((b) => metaOf(b)), p)[0];
      if (hit) {
        cv.setPointerCapture(e.pointerId); Body.setStatic(hit, false);
        const c = Constraint.create({ pointA: p, bodyB: hit, pointB: { x: p.x - hit.position.x, y: p.y - hit.position.y }, stiffness: 0.18, damping: 0.12, length: 0 });
        Composite.add(world, c); drag = { c, anchor: p }; cv.style.cursor = "grabbing";
      } else { spawn(p.x, p.y); }
    };
    const move = (e: PointerEvent) => { if (drag) drag.anchor = pt(e); };
    const up = () => { if (drag) { Composite.remove(world, drag.c); drag = null; cv.style.cursor = "grab"; } };
    cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move); cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);

    const spawn = (x = W / 2, y = 30) => {
      const k: Kind = (["block", "star", "star", "ball", "ball", "moon"] as Kind[])[Math.floor(Math.random() * 6)]!;
      const letters = "PIPZZZ♥ABC"; const b = make(x, Math.min(y, H - 60), k, letters[Math.floor(Math.random() * letters.length)]);
      Body.setVelocity(b, { x: (Math.random() - 0.5) * 6, y: -5 });
      audio.chime(Math.floor(Math.random() * 7));
      // keep the pit from getting crowded
      const all = Composite.allBodies(world).filter((b2) => metaOf(b2)); if (all.length > 46) Composite.remove(world, all[0]!);
    };
    api.current = { spawn: () => spawn(40 + Math.random() * (W - 80), 20), reset: populate };

    build(); populate(); setReady(true);
    const ro = new ResizeObserver(() => build()); ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; }, { rootMargin: "100px" }); io.observe(el);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); cv.removeEventListener("pointerdown", down); cv.removeEventListener("pointermove", move); cv.removeEventListener("pointerup", up); cv.removeEventListener("pointercancel", up); Composite.clear(world, false); Engine.clear(engine); api.current = null; };
  }, []);

  const shake = useCallback(() => { api.current?.reset(); audio.giggle(); }, []);
  const add = useCallback(() => api.current?.spawn(), []);

  return (
    <Win title="rattle-and-blocks.html">
      <div className="toys__pit" ref={wrap}>
        <canvas ref={canvas} role="img" aria-label="A playpen of pastel alphabet blocks, stars, a moon and balls that you can drag and drop" style={{ position: "absolute", inset: 0, display: "block", cursor: "grab", touchAction: "pan-y" }} />
        {ready && <div className="toys__hint" aria-hidden="true">drag the toys · tap empty space to drop a new one</div>}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
        <button className="btn" onClick={add} data-silent>Drop a toy</button>
        <button className="btn btn--ghost" onClick={shake} data-silent>Shake the toybox</button>
        <small style={{ fontFamily: "var(--font-soft)", color: "var(--cocoa-soft)" }}>Hard bumps ring a chime.</small>
      </div>
    </Win>
  );
}
