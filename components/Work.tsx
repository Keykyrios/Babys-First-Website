"use client";

import { Reveal } from "./Shared";
import { LullabyLab } from "./LullabyLab";
import { Nightlights } from "./Nightlights";
import { Toybox } from "./Toybox";
import { Storybook } from "./Storybook";
import { Growth } from "./Growth";

export function Work() {
  return (
    <>
      <section className="section" id="work" aria-labelledby="work-h">
        <div className="wrap">
          <Reveal className="work__head">
            <div>
              <p className="label">Selected work · five projects</p>
              <h2 id="work-h" className="display h2" style={{ margin: "10px 0 0" }}>Things Pip <em>made.</em></h2>
            </div>
            <p className="lede">Everything below is playable. Wind it, shake it, flip it. Pip insists.</p>
          </Reveal>

          <div className="proj">
            <Reveal className="proj__copy">
              <p className="proj__no">№ 01</p>
              <h3 className="display">The Lullaby <em>Lab</em></h3>
              <p>A music box that plays a tune only while its spring unwinds. Wind the golden key; the melody wanders, slows down and sleeps. Every note is synthesised live, so no two lullabies match.</p>
              <span className="sticker" style={{ "--rot": "2deg" } as React.CSSProperties}>Web Audio · generative</span>
            </Reveal>
            <Reveal delay={100}><LullabyLab /></Reveal>
          </div>
        </div>
      </section>

      <Nightlights />

      <section className="section" aria-labelledby="toys-h">
        <div className="wrap proj proj--flip">
          <Reveal className="proj__copy">
            <p className="proj__no">№ 03</p>
            <h3 id="toys-h" className="display">Rattle &amp; <em>Blocks</em></h3>
            <p>A playpen of soft, round things with real physics. Fling one at the wall, grab another mid-air, or tap for a burst. Pip tests every toy personally, mostly by dropping it.</p>
            <span className="sticker" style={{ "--rot": "-2deg", background: "var(--lilac)" } as React.CSSProperties}>canvas · physics</span>
          </Reveal>
          <Reveal delay={100}><Toybox /></Reveal>
        </div>
      </section>

      <section className="section" style={{ background: "var(--cream-deep)" }} aria-labelledby="book-h">
        <div className="wrap proj">
          <Reveal className="proj__copy">
            <p className="proj__no">№ 04</p>
            <h3 id="book-h" className="display">The Bedtime <em>Storybook</em></h3>
            <p>Written and illustrated by Pip, a few sleepy words a page. On the cover, a nightlight follows your cursor and reveals the picture in little printed dots. Swipe, tap or use the arrow keys to turn the pages.</p>
            <span className="sticker" style={{ "--rot": "2deg", background: "var(--blush)" } as React.CSSProperties}>flip-book · flashlight cursor</span>
          </Reveal>
          <Reveal delay={100}><Storybook /></Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="growth-h">
        <div className="wrap proj proj--flip">
          <Reveal className="proj__copy">
            <p className="proj__no">№ 05</p>
            <h3 id="growth-h" className="display">Pip&apos;s <em>Growth Chart</em></h3>
            <p>Skills, measured the way families measure babies: pencil marks on the nursery wall. Napping is, as always, off the chart.</p>
            <span className="sticker" style={{ "--rot": "-2deg", background: "var(--butter)" } as React.CSSProperties}>pencil on plaster</span>
          </Reveal>
          <Reveal delay={100}><Growth /></Reveal>
        </div>
      </section>
    </>
  );
}
