"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TearTicket from "./vendor/TearTicket";
import { Reveal } from "./Shared";
import { usePip } from "./Providers";
import { addWish, subscribeWishes, type Wish } from "@/lib/firebase";
import { audio } from "@/lib/audio";

const TINTS = ["#fbdde4", "#fbeab0", "#e8def6", "#ffeccc", "#f6cfdb"];
const BAD = /\b(fuck|shit|bitch|asshole|dick|cunt|nigg|fag|slut|whore|rape|nazi)\w*/i;
const COOLDOWN_MS = 25000;

const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };

export function Guestbook() {
  const { memory, updateMemory, toast } = usePip();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [offline, setOffline] = useState(false);
  const [local, setLocal] = useState<Wish[]>([]);
  const [torn, setTorn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => { if (memory?.name && !name) setName(memory.name); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [memory?.name]);

  const [near, setNear] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "900px" });
    io.observe(el); return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let off: (() => void) | undefined; let dead = false;
    const giveUp = window.setTimeout(() => { if (!dead) { setOffline(true); setWishes((x) => x ?? []); } }, 7000);
    subscribeWishes((w) => { if (!dead) { window.clearTimeout(giveUp); setWishes(w); setOffline(false); } }, () => { if (!dead) { setOffline(true); setWishes((x) => x ?? []); } }).then((u) => { off = u; });
    return () => { dead = true; window.clearTimeout(giveUp); off?.(); };
  }, [near]);

  const clean = useMemo(() => ({ name: name.trim().slice(0, 24), text: text.trim().slice(0, 140) }), [name, text]);
  const valid = clean.name.length >= 1 && clean.text.length >= 2;

  const send = async () => {
    if (busy) return;
    if (!valid) { toast("Add your name and a wish first (at least 2 letters)."); setTorn(false); setRound((r) => r + 1); return; }
    if (BAD.test(clean.text) || BAD.test(clean.name)) { toast("Pip only collects kind wishes. Try rewording it?"); setTorn(false); setRound((r) => r + 1); return; }
    let last = 0; try { last = Number(localStorage.getItem("pip-wish-at") ?? 0); } catch { /* ignore */ }
    if (Date.now() - last < COOLDOWN_MS) { toast("One wish at a time. Pip is still reading your last one."); setTorn(false); setRound((r) => r + 1); return; }
    setBusy(true);
    const tint = Math.abs(hash(clean.name + clean.text)) % TINTS.length;
    try {
      // firebase never rejects while offline (it queues the write), so cap the wait
      await Promise.race([
        addWish({ ...clean, tint }),
        new Promise<never>((_, rej) => window.setTimeout(() => rej(new Error("timeout")), 6000)),
      ]);
      try { localStorage.setItem("pip-wish-at", String(Date.now())); } catch { /* ignore */ }
      updateMemory({ name: clean.name, wishes: (memory?.wishes ?? 0) + 1 });
      audio.sparkle();
      toast("Wish delivered! It's floating onto Pip's wall.");
      const { default: confetti } = await import("canvas-confetti");
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 }, colors: ["#f4b8c6", "#f7dc8f", "#cdbbe9", "#fff3c9"], scalar: 1.1 });
      setText("");
    } catch {
      setLocal((l) => [{ id: `local-${Date.now()}`, name: clean.name, text: clean.text, tint, ts: Date.now() }, ...l]);
      toast("Couldn't reach the live wall. Your wish is pinned on this device only.");
      setOffline(true);
    } finally {
      setBusy(false);
      window.setTimeout(() => { setTorn(false); setRound((r) => r + 1); }, 1400);
    }
  };

  const all = [...local, ...(wishes ?? [])];

  return (
    <section className="section" id="wishes" aria-labelledby="wishes-h" ref={sectionRef}>
      <div className="wrap gb__grid">
        <div>
          <Reveal>
            <p className="label">Live guestbook · +2 for the wall</p>
            <h2 id="wishes-h" className="display h2" style={{ margin: "10px 0 14px" }}>Leave Pip a <em>wish.</em></h2>
            <p className="lede" style={{ marginBottom: 26 }}>Write a dream you&apos;d like delivered tonight, then tear the ticket. It lands on the wall below for every visitor, live.</p>
          </Reveal>
          <Reveal delay={80}>
            <form className="gb__form" onSubmit={(e) => { e.preventDefault(); setTorn(true); void send(); }}>
              <label className="field">Your name
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoComplete="given-name" placeholder="e.g. Maya" required />
              </label>
              <label className="field">Your wish <span style={{ fontWeight: 500, opacity: .7 }}>({clean.text.length}/140)</span>
                <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={140} rows={3} placeholder="a dream about flying over a warm blue sea…" required />
              </label>
              <div className="ticket-slot" key={round}>
                <TearTicket width={440} height={210} stubSize={130} background="#fbdde4" color="#5c4033" borderColor="#5c4033" borderWidth={2} stubBackground="#f7dc8f" radius={18} holes={9} rotate={3} torn={torn}
                  onTear={() => { setTorn(true); void send(); }} ariaLabel="Tear the ticket to send your wish"
                  stub={<div className="ticket-stub">admit one dream</div>}>
                  <div className="ticket-body">
                    <small>Dream delivery · tonight</small>
                    <b>{clean.text || "your wish goes here"}</b>
                    <small>for Pip · from {clean.name || "…"}</small>
                  </div>
                </TearTicket>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <button className="btn" type="submit" disabled={busy}>{busy ? "Delivering…" : "Send my wish"}</button>
                <span className="gb__status">…or just drag the ticket&apos;s stub away.</span>
              </div>
            </form>
          </Reveal>
        </div>

        <div>
          <p className="label" style={{ marginBottom: 14 }} id="wall-h">The wall {offline && <span className="sticker" style={{ "--rot": "2deg", marginLeft: 8, background: "var(--blush)" } as React.CSSProperties}>offline mode</span>}</p>
          <div className="wall" {...(all.length ? { role: "list", "aria-labelledby": "wall-h" } : {})} aria-live="polite">
            {wishes === null && <p className="gb__status">fetching wishes from the clouds…</p>}
            {wishes !== null && all.length === 0 && <p className="gb__status">{offline ? "The live wall is out of reach right now. Wishes you send will pin here on this device." : "No wishes yet. Be the first to put one on the wall."}</p>}
            {all.map((w) => (
              <article className="wish" role="listitem" key={w.id} style={{ "--tint": TINTS[w.tint % TINTS.length], "--rot": `${(hash(w.id) % 7) - 3}deg` } as React.CSSProperties}>
                <p>{w.text}</p>
                <small>— {w.name}</small>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
