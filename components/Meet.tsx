"use client";

import { useEffect, useState } from "react";
import HoloCard from "./vendor/HoloCard";
import { InView, Reveal } from "./Shared";
import { audio } from "@/lib/audio";

const ROWS: Array<[string, string]> = [
  ["What Pip is", "A baby with a smooth, round skull face, two huge soft eye sockets with warm amber night-lights inside, a tiny crooked smile and a starry nightcap with a pink bow. Always cuddly. Never scary."],
  ["Personality", "Curious, sleepy, a little clumsy and easily delighted. Giggles at everything. Hates silence."],
  ["Profession", "Junior Dream Engineer at the Midnight Nursery: dreams, lullabies, night-lights and bedtime stories for the neighbourhood's little ghosts and creatures."],
  ["Voice", "Soft, lowercase, mid-yawn. Mostly says “hehe”."],
];

export function Meet() {
  const [cw, setCw] = useState(340);
  useEffect(() => { const f = () => setCw(window.innerWidth < 420 ? 270 : 340); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return (
    <section className="section" id="meet" aria-labelledby="meet-h">
      <div className="wrap meet__grid">
        <Reveal className="meet__card">
          <div onPointerEnter={() => audio.chime(3)} style={{ width: cw, aspectRatio: "63 / 88", position: "relative" }}>
            <img src="/art/pip-portrait.webp" alt="" width={682} height={1024} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 26 }} aria-hidden="true" />
            <InView style={{ position: "absolute", inset: 0 }} margin="150px"><HoloCard image="/art/pip-portrait.webp" alt="Official portrait of Pip holding a glowing star lantern and a unicorn music box" preset="glitter" foilColor="#ffd9e4" intensity={0.28} edgeSparkle={0.6} glare={0.3} width={cw} radius={26} frame={5} tiltMax={13} /></InView>
          </div>
          <span className="sticker" style={{ marginTop: 22, "--rot": "-2deg", background: "var(--blush)" } as React.CSSProperties}>Pip · No. 001 · hover the card, it&apos;s shiny</span>
        </Reveal>

        <div className="meet__sheet">
          <Reveal>
            <p className="label">The character sheet</p>
            <h2 id="meet-h" className="display h2" style={{ margin: "10px 0 0" }}>Meet the <em>baby.</em></h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="quote">&ldquo;I build the dreams you fall asleep inside.&rdquo;</p>
          </Reveal>
          <Reveal delay={120}>
            <dl style={{ margin: 0 }}>
              {ROWS.map(([k, v]) => <div className="sheet-row" key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </Reveal>
          <Reveal delay={160} className="chips">
            {["giggles at everything", "hates silence", "a little clumsy", "pom-pom certified", "glows in the dark"].map((c, i) => (
              <span key={c} className="sticker" style={{ "--rot": `${(i % 2 ? 1 : -1) * (1.5 + i)}deg`, background: ["var(--butter)", "var(--lilac)", "var(--blush)", "var(--butter)", "var(--lilac)"][i] } as React.CSSProperties}>{c}</span>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
