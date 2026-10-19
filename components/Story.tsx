"use client";

import { useEffect, useRef } from "react";

interface Scene { no: string; title: string; body: string; art: "sky" | "portrait" | "lamp" | "hero" | "moonlamp" }
const SCENES: Scene[] = [
  { no: "01", title: "Lights out at the Midnight Nursery", body: "Every night the nursery lights turn amber. The little ghosts yawn. The creatures curl up. Upstairs, a very small engineer pulls on a nightcap.", art: "sky" },
  { no: "02", title: "A very small job", body: "Pip got the job on a Tuesday, mostly because nobody else fit through the dream-vent. The nightcap came free. So did the pom-pom.", art: "portrait" },
  { no: "03", title: "The dream workshop", body: "Dreams are built from three things: a warm light, a small tune and one good idea. Pip keeps all three in the workshop, next to the snacks.", art: "lamp" },
  { no: "04", title: "Delivery night", body: "When the lights go out, Pip rides a cloud over the rooftops. Window by window, dream by dream. Clumsy landings are fully expected.", art: "hero" },
  { no: "05", title: "Sleep tight", body: "By dawn every little creature is asleep. Pip yawns, hangs up the nightcap and counts one more star. Tomorrow: more dreams. Tonight: yours.", art: "moonlamp" },
];

function Art({ kind }: { kind: Scene["art"] }) {
  if (kind === "sky") {
    return (
      <div className="arch scene__art scene__art--sky" role="img" aria-label="A sleepy crescent moon in a violet evening sky with little stars">
        <img src="/art/moon.png" alt="" width={155} height={195} style={{ position: "absolute", left: "26%", top: "20%", width: "48%", animation: "bob 6s ease-in-out infinite", objectFit: "contain", height: "auto" }} />
        <img src="/art/star-gold.png" alt="" width={46} height={46} style={{ position: "absolute", left: "12%", top: "50%", width: "13%", height: "auto", objectFit: "contain", animation: "twinkle 3.2s infinite" }} />
        <img src="/art/star-lav.png" alt="" width={46} height={46} style={{ position: "absolute", right: "14%", top: "56%", width: "11%", height: "auto", objectFit: "contain", animation: "twinkle 4s infinite .8s" }} />
        <img src="/art/star-gold2.png" alt="" width={46} height={46} style={{ position: "absolute", right: "30%", top: "12%", width: "9%", height: "auto", objectFit: "contain", animation: "twinkle 3.6s infinite 1.6s" }} />
        <img src="/art/star-lav2.png" alt="" width={46} height={46} style={{ position: "absolute", left: "22%", top: "76%", width: "10%", height: "auto", objectFit: "contain", animation: "twinkle 3.9s infinite .4s" }} />
      </div>
    );
  }
  const map = {
    portrait: { src: "/art/pip-portrait.webp", alt: "Pip in a starry nightcap, holding a lantern and a music box", pos: "50% 22%", w: 682, h: 1024 },
    lamp: { src: "/art/lantern-hold.webp", alt: "Pip's hand holding a glowing star lantern", pos: "55% 50%", w: 960, h: 705 },
    hero: { src: "/art/pip-hero.webp", alt: "Pip waving from a soft cloud", pos: "50% 55%", w: 896, h: 1090 },
    moonlamp: { src: "/art/lantern-moon.webp", alt: "A glowing moon night-light", pos: "50% 55%", w: 1024, h: 914 },
  }[kind];
  return (
    <div className="arch scene__art">
      <img className="art-img" src={map.src} alt={map.alt} width={map.w} height={map.h} loading="lazy" decoding="async" style={{ objectPosition: map.pos }} />
    </div>
  );
}

export function Story() {
  const pinRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
        const rail = railRef.current, pin = pinRef.current; if (!rail || !pin) return;
        const dist = () => Math.max(0, rail.scrollWidth - window.innerWidth);
        gsap.to(rail, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: pin, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => { if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`; },
          },
        });
      });
      // webfonts / images shift layout, so re-measure once things settle
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh);
      const t = window.setTimeout(refresh, 1200);
      cleanup = () => { window.removeEventListener("load", refresh); window.clearTimeout(t); mm.revert(); };
    })();
    return () => { cancelled = true; cleanup(); };
  }, []);

  return (
    <section className="story" id="story" aria-labelledby="story-h">
      <div className="wrap story__head">
        <p className="label">Origin story · five scenes</p>
        <h2 id="story-h" className="display h2" style={{ margin: "10px 0 0" }}>How Pip got <em>the job.</em></h2>
      </div>
      <div className="story__pin" ref={pinRef}>
        <div className="story__rail" ref={railRef} tabIndex={0} aria-label="Story scenes. Scroll sideways on small screens.">
          {SCENES.map((s) => (
            <article className="scene" key={s.no}>
              <Art kind={s.art} />
              <div>
                <div className="scene__no" aria-hidden="true">{s.no}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="story__progress" aria-hidden="true"><i ref={barRef as never} /></div>
      </div>
    </section>
  );
}
