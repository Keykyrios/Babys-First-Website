"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePip } from "./Providers";
import { IDLE_LINES, OPENERS, reply } from "@/lib/pip-brain";
import { audio } from "@/lib/audio";

interface Msg { id: number; from: "pip" | "you"; text: string }
let seq = 0;

export function PipChat() {
  const { hello, memory, mood, setMood, updateMemory } = usePip();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [ping, setPing] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);
  const nudged = useRef(false);

  // greet once, using what Pip remembers
  useEffect(() => {
    if (!open || seeded.current) return; seeded.current = true;
    setMsgs([{ id: seq++, from: "pip", text: hello }, { id: seq++, from: "pip", text: memory?.name ? "ask me anything, or try a chip below." : "what's your name? (or try a chip below)" }]);
  }, [open, hello, memory?.name]);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [msgs, typing]);

  // Pip hates silence: one gentle nudge per visit if the chat stays unopened
  useEffect(() => {
    const t = window.setTimeout(() => { if (!nudged.current && !open) { nudged.current = true; setPing(IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)]!); window.setTimeout(() => setPing(null), 7000); } }, 42000);
    return () => window.clearTimeout(t);
  }, [open]);

  const say = useCallback((text: string, act?: string) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false); setMsgs((m) => [...m, { id: seq++, from: "pip", text }]); audio.chime(2);
      if (act === "giggle") audio.giggle();
      if (act === "night") setMood("night");
      if (act === "day") setMood("day");
      if (act === "lullaby") window.dispatchEvent(new Event("pip:lullaby"));
      if (act === "wish") document.getElementById("wishes")?.scrollIntoView({ behavior: "smooth" });
    }, 520 + Math.random() * 420);
  }, [setMood]);

  const send = useCallback((raw: string) => {
    const t = raw.trim(); if (!t) return;
    setMsgs((m) => [...m, { id: seq++, from: "you", text: t }]); setInput("");
    const out = reply(t, { name: memory?.name ?? "", night: mood === "night", visits: memory?.visits ?? 1, wishes: memory?.wishes ?? 0 });
    if (out.setName) updateMemory({ name: out.setName });
    say(out.text, out.action);
  }, [memory, mood, say, updateMemory]);

  return (
    <>
      {ping && !open && <span className="chat-fab__ping" role="status">{ping}</span>}
      <button className="chat-fab" onClick={() => { setOpen((o) => !o); setPing(null); }} aria-expanded={open} aria-controls="pip-chat" aria-label={open ? "Close chat with Pip" : "Chat with Pip"}>
        <img src="/art/pip-face-144.webp" alt="" width={68} height={68} />
      </button>
      {open && (
        <div className="chat" id="pip-chat" role="dialog" aria-label="Chat with Pip">
          <div className="chat__head">
            <img src="/art/pip-face-144.webp" alt="" width={40} height={40} />
            <div><b>Pip</b><small>junior dream engineer · rule-based, very sleepy</small></div>
            <button className="nav__tool chat__x" onClick={() => setOpen(false)} aria-label="Close chat" data-silent style={{ width: 34, height: 34 }}>×</button>
          </div>
          <div className="chat__log" ref={logRef} role="log" aria-live="polite">
            {msgs.map((m) => <div key={m.id} className={`msg msg--${m.from}`}>{m.text}</div>)}
            {typing && <div className="msg msg--pip typing" aria-label="Pip is typing"><i /><i /><i /></div>}
          </div>
          <div className="chat__chips">{OPENERS.map((o) => <button key={o} onClick={() => send(o)}>{o}</button>)}</div>
          <form className="chat__form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="say something to Pip…" aria-label="Message to Pip" maxLength={160} />
            <button className="btn" type="submit" style={{ padding: "8px 18px", boxShadow: "none" }}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}
