"use client";

import dynamic from "next/dynamic";
import { OrbitCardStack, type OrbitStackItem } from "./vendor/OrbitCardStack";
import { InView } from "./Shared";
import { usePip } from "./Providers";
import { audio } from "@/lib/audio";

const GhostFibers = dynamic(() => import("./vendor/GhostFibers"), { ssr: false });

const ITEMS: OrbitStackItem[] = [
  { name: "Moon Lamp", role: "Bedside · warm amber", description: "A sleeping crescent that glows like a held breath. Dimmable by cuddling.", accent: "#f0e1cc", stat: "Glow · 2700K", image: "/art/lantern-moon.webp" },
  { name: "Star Lantern", role: "Carried · hallway trips", description: "Four little stars cut into the glass. Pip takes it everywhere, even where lanterns shouldn't go.", accent: "#f7dc8f", stat: "Stars · 4", image: "/art/lantern-hold.webp" },
  { name: "Pocket Moon", role: "Tiny hands · under the blanket", description: "A moon small enough to hold, with a face that says it's all going to be fine.", accent: "#cdbbe9", stat: "Mood · calm", image: "/art/pocket-moon.webp" },
];

export function Nightlights() {
  const { mood } = usePip();
  return (
    <section className="lights section" aria-labelledby="lights-h">
      <InView className="lights__bg" margin="200px">
        <GhostFibers glowColor="#ffc766" lineColor="#ff9fbd" secondaryColor="#b7a2ff" speed={0.5} brightness={mood === "night" ? 1.15 : 0.95} dpr={1} particles={0.4} grain={0.15} style={{ width: "100%", height: "100%" }} />
      </InView>
      <div className="wrap lights__inner">
        <div className="work__head">
          <div>
            <p className="label"><span className="proj__no">№ 02</span> · Nightlight Collection</p>
            <h3 id="lights-h" className="display h2" style={{ margin: "10px 0 0" }}>Three small <em>suns</em> for the dark.</h3>
          </div>
          <p className="lede" style={{ color: "#dccadb" }}>Hover, tap or arrow-key through the stack. Each lamp was designed to be a little brighter than the dark is big.</p>
        </div>
        <div className="lights__stage orbit-wrap" onPointerEnter={() => audio.chime(5)}>
          <OrbitCardStack items={ITEMS} defaultActiveIndex={1} spread={230} lift={30} />
        </div>
      </div>
    </section>
  );
}
