"use client";

import { usePip } from "./Providers";

const LINKS = [["Meet Pip", "#meet"], ["Story", "#story"], ["Work", "#work"], ["Hold Pip", "#hold"], ["Wishes", "#wishes"]];

export function Nav() {
  const { mood, toggleMood, muted, toggleMuted } = usePip();
  const night = mood === "night";
  return (
    <header className="nav">
      <nav className="nav__pill" aria-label="Main">
        <a className="nav__brand" href="#top"><img src="/art/pip-face-144.webp" alt="" width={30} height={30} />Pip</a>
        <div className="nav__links">{LINKS.map(([l, h]) => <a key={h} href={h}>{l}</a>)}</div>
        <button className="nav__tool" onClick={toggleMood} aria-pressed={night} aria-label={night ? "Lights on (switch to day)" : "Lights out (switch to night)"} title={night ? "Lights on" : "Lights out"}>{night ? "☀" : "☾"}</button>
        <button className="nav__tool is-sound" onClick={toggleMuted} aria-pressed={muted} aria-label={muted ? "Unmute sound" : "Mute sound"} title={muted ? "Sound is off" : "Sound is on"}>♪</button>
      </nav>
    </header>
  );
}
