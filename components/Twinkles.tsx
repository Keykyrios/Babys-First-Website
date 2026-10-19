export function Twinkles() {
  const dots = Array.from({ length: 34 }, (_, i) => ({ l: (i * 37) % 100, t: (i * 53) % 100, d: 2.4 + (i % 5) * 0.7, dl: (i % 7) * 0.4 }));
  return <div className="twinkles" aria-hidden="true">{dots.map((s, i) => <i key={i} style={{ left: `${s.l}%`, top: `${s.t}%`, "--d": `${s.d}s`, "--dl": `${s.dl}s` } as React.CSSProperties} />)}</div>;
}
