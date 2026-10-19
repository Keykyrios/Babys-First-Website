"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { InView } from "./Shared";

const FallingText = dynamic(() => import("./vendor/FallingText"), { ssr: false });

export function Footer() {
  const [size, setSize] = useState("");
  useEffect(() => {
    const f = () => setSize(`${window.innerWidth}×${window.innerHeight}`);
    f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f);
  }, []);
  return (
    <footer className="foot">
      <div className="wrap" style={{ paddingTop: "clamp(60px,9vw,110px)" }}>
        <h2 className="display">Sleep tight,<br /><em>little ghosts.</em></h2>
        <div className="foot__fall" aria-hidden="true">
          <InView style={{ position: "absolute", inset: 0 }}>
            <FallingText text="goodnight moon goodnight stars goodnight Pip goodnight you" highlightWords={["moon", "stars", "Pip", "you"]} trigger="scroll" fontSize="clamp(1.4rem, 4vw, 2.6rem)" gravity={0.8} backgroundColor="transparent" accentColor="#f4b8c6" theme="dark" />
          </InView>
        </div>
        <p className="sr-only">Goodnight moon, goodnight stars, goodnight Pip, goodnight you.</p>
        <div className="badges" aria-label="Little badges">
          <a className="b88" href="#top">↑ top</a>
          <span className="b88">no cookies</span>
          <span className="b88">made w/ ♥</span>
          <span className="b88 blink">nap in progress</span>
          <span className="b88" style={{ width: "auto", padding: "0 10px" }}>best viewed at {size || "your size"}</span>
        </div>
        <div className="credits">
          <div><h3>Art</h3><p>Pip, the music box, the lantern and all character renders: the official haX.baby Pip Creator Asset Pack (Track 1). The moon and star sprites, the lantern-in-hand and unicorn crops, and the Pocket Moon scene are cut or composed from that pack. No other imagery is used; I could not generate or fetch new images.</p></div>
          <div><h3>Code &amp; components</h3><ul>
            <li>React Bits (David Haz): HoloCard, GhostFibers, TearTicket, HalftoneReveal, FallingText</li>
            <li>Componentry (Harsh Jadhav): Orbit Card Stack</li>
            <li>cursor-effects (Tim Holman): sparkle trail</li>
            <li>three.js, React Three Fiber, drei, GSAP, Matter.js, motion, canvas-confetti, Firebase</li>
          </ul></div>
          <div><h3>Type &amp; sound</h3><p>Fraunces, Fredoka and Nunito (SIL Open Font License). Every sound is synthesised live with the Web Audio API.</p><h3 style={{ marginTop: 14 }}>Built for</h3><p>haX.baby · Baby&apos;s First Website · Track 1.</p></div>
        </div>
      </div>
    </footer>
  );
}
