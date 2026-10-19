"use client";

/**
 * Tiny Web Audio engine. Everything is synthesised, so there are no audio
 * files to download (keeps the page light) and nothing to license.
 * One master gain = one mute switch for the whole site.
 */

type Listener = () => void;
const KEY = "pip-muted-v1";

// C major pentatonic, music-box register
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
// a soft, original little phrase the box falls back to between wanderings
const MOTIF = [2, 4, 3, 2, 0, 2, 1, 0, 2, 3, 4, 2, 3, 1, 0, 0];

class PipAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private listeners = new Set<Listener>();
  muted = false;
  tension = 0; // 0..1 — how wound the music box is
  private timer: number | null = null;
  private step = 0;
  private last = 2;
  onNote: ((freq: number, idx: number) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      try { this.muted = localStorage.getItem(KEY) === "1"; } catch { /* private mode */ }
    }
  }

  subscribe = (l: Listener) => { this.listeners.add(l); return () => { this.listeners.delete(l); }; };
  private emit() { this.listeners.forEach((l) => l()); }

  private ensure() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp).connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setMuted(m: boolean) {
    this.muted = m;
    try { localStorage.setItem(KEY, m ? "1" : "0"); } catch { /* ignore */ }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.03);
    if (m) this.stopBox();
    this.emit();
  }

  /** one bell-ish voice: fundamental + soft inharmonic partials */
  private bell(freq: number, when: number, vol = 0.16, decay = 1.6) {
    const ctx = this.ctx!; const out = this.master!;
    const partials: Array<[number, number]> = [[1, 1], [2.01, 0.34], [3.98, 0.12], [5.4, 0.05]];
    partials.forEach(([m, g]) => {
      const o = ctx.createOscillator(); const gn = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * m;
      gn.gain.setValueAtTime(0.0001, when);
      gn.gain.exponentialRampToValueAtTime(vol * g, when + 0.008);
      gn.gain.exponentialRampToValueAtTime(0.0001, when + decay / m);
      o.connect(gn).connect(out); o.start(when); o.stop(when + decay + 0.05);
    });
  }

  /** a soft "pop" for every click */
  click() {
    if (this.muted) return; const ctx = this.ensure(); if (!ctx || !this.master) return;
    const t = ctx.currentTime; const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.09);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.16);
  }

  chime(i = 0) {
    if (this.muted) return; const ctx = this.ensure(); if (!ctx) return;
    this.bell(SCALE[i % SCALE.length]!, ctx.currentTime, 0.14, 1.4);
  }

  /** hehehe — quick wobbling blips */
  giggle() {
    if (this.muted) return; const ctx = this.ensure(); if (!ctx || !this.master) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const t = t0 + i * 0.105; const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "triangle"; const base = 640 + (i % 2) * 150 + i * 18;
      o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * 1.28, t + 0.07);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.11);
    }
  }

  /** little ascending sparkle for easter eggs / success */
  sparkle() {
    if (this.muted) return; const ctx = this.ensure(); if (!ctx) return;
    const t = ctx.currentTime; [0, 2, 3, 4, 5, 6].forEach((n, i) => this.bell(SCALE[n]!, t + i * 0.09, 0.13, 1.2));
  }

  /** a slower, lower goodnight phrase (used by the sleepy-moon easter egg) */
  goodnight() {
    if (this.muted) return; const ctx = this.ensure(); if (!ctx) return;
    const t = ctx.currentTime; const notes = [4, 3, 2, 0, 1, 2, 0, 0];
    notes.forEach((n, i) => this.bell(SCALE[n]! / 2, t + i * 0.62, 0.17, 2.4));
  }

  // ── Music box ───────────────────────────────────────────────
  wind(amount = 0.34) {
    this.tension = Math.min(1, this.tension + amount);
    this.click();
    this.startBox();
    this.emit();
  }

  private startBox() {
    if (this.timer !== null) return;
    const tick = () => {
      if (this.muted) { this.timer = null; return; }
      const ctx = this.ensure(); if (!ctx || !this.master) { this.timer = null; return; }
      if (this.tension <= 0.01) { this.tension = 0; this.timer = null; this.emit(); return; }
      // generative: mostly follow the motif, sometimes wander by a step
      let idx = MOTIF[this.step % MOTIF.length]!;
      if (Math.random() < 0.28) idx = Math.max(0, Math.min(SCALE.length - 1, this.last + (Math.random() < 0.5 ? -1 : 1)));
      this.last = idx; this.step++;
      const f = SCALE[idx]!; this.bell(f, ctx.currentTime + 0.02, 0.17, 1.9);
      this.onNote?.(f, idx);
      // the spring unwinds, so the tune slows down and finally stops
      this.tension = Math.max(0, this.tension - 0.0095);
      const interval = 360 + (1 - this.tension) * 640;
      this.emit();
      this.timer = window.setTimeout(tick, interval);
    };
    this.timer = window.setTimeout(tick, 80);
  }

  stopBox() {
    if (this.timer !== null) { window.clearTimeout(this.timer); this.timer = null; }
    this.tension = 0; this.emit();
  }
}

export const audio = new PipAudio();
