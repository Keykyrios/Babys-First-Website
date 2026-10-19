"use client";

import { useEffect, useState } from "react";
import { Odometer } from "./Shared";
import { usePip } from "./Providers";
import { bumpVisits } from "@/lib/firebase";

const LINES = ["Good things start small", "Dreams delivered nightly", "Nightcap: on", "Pom-pom approved", "Hates silence", "Best viewed sleepy", "Made with a very small heart"];

export function Stats() {
  const { memory } = usePip();
  const [visits, setVisits] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // keep Firebase off the critical path: count the visit once the page has settled
    const t = window.setTimeout(() => { bumpVisits().then((n) => { if (n === null) setOffline(true); else setVisits(n); }); }, 2500);
    return () => window.clearTimeout(t);
  }, []);
  const shown = visits ?? (offline ? memory?.visits ?? 1 : 0);

  return (
    <div>
      <div className="band" aria-hidden="true">
        <div className="band__track">
          {[...LINES, ...LINES].map((l, i) => <span className="band__item" key={i}>{l}</span>)}
        </div>
      </div>
      <div className="wrap stats">
        <p className="stats__lead">Pip has delivered <em>this many</em> dreams so far.</p>
        <div className="stats__cell">
          <Odometer value={shown} label="Dreams delivered" />
          <small>dreams delivered{offline ? " (counting offline)" : " · every visit is one"}</small>
        </div>
        <div className="stats__cell">
          <span className="sticker" style={{ "--rot": "3deg", background: "var(--blush)" } as React.CSSProperties}>
            {memory ? `visit #${memory.visits} from this window` : "hello, visitor"}
          </span>
          <small>you are expected</small>
        </div>
      </div>
    </div>
  );
}
