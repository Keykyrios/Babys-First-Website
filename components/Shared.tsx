"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

/** fade-up once when scrolled into view (no scroll listeners; IntersectionObserver only) */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div", style }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" | "article"; style?: CSSProperties }) {
  const ref = useRef<HTMLElement | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={`rv ${on ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</Tag>;
}

/** pastel early-web window chrome */
export function Win({ title, children, className = "", bodyClass = "" }: { title: string; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <div className={`win ${className}`}>
      <div className="win__bar" aria-hidden="true"><span className="win__dot" /><span className="win__dot" /><span className="win__dot" /><span className="win__title">{title}</span></div>
      <div className={`win__body ${bodyClass}`}>{children}</div>
    </div>
  );
}

/** rolling visitor odometer */
export function Odometer({ value, digits = 6, label }: { value: number; digits?: number; label: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = window.setTimeout(() => setShown(value), 120); return () => window.clearTimeout(t); }, [value]);
  const str = String(Math.max(0, shown)).padStart(digits, "0").slice(-digits);
  return (
    <div role="img" aria-label={`${label}: ${value}`}>
      <div className="odo" aria-hidden="true">
        {str.split("").map((d, i) => (
          <span className="odo__digit" key={i}>
            <span className="odo__col" style={{ transform: `translateY(-${Number(d) * 2.1}em)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n}>{n}</span>)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** mounts children only while near the viewport, so offscreen WebGL is torn down and costs nothing */
export function InView({ children, className = "", style, margin = "300px" }: { children: ReactNode; className?: string; style?: CSSProperties; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(!!e?.isIntersecting), { rootMargin: margin });
    io.observe(el); return () => io.disconnect();
  }, [margin]);
  return <div ref={ref} className={className} style={style}>{seen ? children : null}</div>;
}
