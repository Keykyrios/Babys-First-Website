/**
 * Five illustrated spreads for the bedtime storybook. Plain inline SVG in Pip's
 * clay-pastel palette; the moon, stars and character renders are the official art.
 */
const INK = "#5c4033";

function Sparkle({ x, y, s = 1, c = "#f7dc8f", o = 1 }: { x: number; y: number; s?: number; c?: string; o?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill={c} d="M0-9 C1.2-3 3-1.2 9 0 C3 1.2 1.2 3 0 9 C-1.2 3-3 1.2-9 0 C-3-1.2-1.2-3 0-9Z" />;
}

function Cloud({ x, y, s = 1, c = "#fdf4f7", o = 1 }: { x: number; y: number; s?: number; c?: string; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill={c}>
      <ellipse cx="0" cy="0" rx="46" ry="16" /><circle cx="-16" cy="-12" r="16" /><circle cx="8" cy="-17" r="20" /><circle cx="28" cy="-6" r="13" />
    </g>
  );
}

function Rooftops({ y = 250, fill = "#2a2050", windows = true, lit = "#f7dc8f" }: { y?: number; fill?: string; windows?: boolean; lit?: string }) {
  const h = [
    { x: 0, w: 70, h: 54, r: 28 }, { x: 70, w: 52, h: 80, r: 0 }, { x: 122, w: 74, h: 46, r: 30 },
    { x: 196, w: 58, h: 70, r: 0 }, { x: 254, w: 76, h: 52, r: 30 }, { x: 330, w: 70, h: 84, r: 0 },
  ];
  return (
    <g>
      {h.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={y + 84 - b.h} width={b.w} height={b.h + 40} fill={fill} />
          {b.r > 0 && <path d={`M${b.x - 4} ${y + 84 - b.h} L${b.x + b.w / 2} ${y + 84 - b.h - b.r} L${b.x + b.w + 4} ${y + 84 - b.h}Z`} fill={fill} />}
          {b.r === 0 && <rect x={b.x + b.w - 16} y={y + 84 - b.h - 16} width="9" height="18" fill={fill} />}
          {windows && <rect x={b.x + b.w / 2 - 6} y={y + 84 - b.h + 14} width="12" height="15" rx="6" fill={lit} opacity={i % 3 === 1 ? 0.35 : 0.95} />}
        </g>
      ))}
    </g>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2d62" /><stop offset=".55" stopColor="#7a5aa8" /><stop offset="1" stopColor="#f1a6b8" /></linearGradient>
      <linearGradient id={`rose-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbdde4" /><stop offset="1" stopColor="#d9c8f0" /></linearGradient>
      <linearGradient id={`deep-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#221a3a" /><stop offset="1" stopColor="#46387a" /></linearGradient>
      <radialGradient id={`glow-${id}`}><stop offset="0" stopColor="#ffd98a" stopOpacity=".95" /><stop offset=".55" stopColor="#ffc766" stopOpacity=".28" /><stop offset="1" stopColor="#ffc766" stopOpacity="0" /></radialGradient>
      <clipPath id={`med-${id}`}><circle cx="200" cy="140" r="104" /></clipPath>
    </defs>
  );
}

/** circular picture frame for the character renders */
function Medallion({ id, href, w, h, x, y }: { id: string; href: string; w: number; h: number; x: number; y: number }) {
  return (
    <g>
      <circle cx="200" cy="140" r="118" fill="#fff8f1" opacity=".22" />
      <circle cx="200" cy="140" r="108" fill="#faf1e2" stroke="#fff8f1" strokeWidth="5" />
      <g clipPath={`url(#med-${id})`}><image href={href} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" /></g>
      <circle cx="200" cy="140" r="106" fill="none" stroke={INK} strokeWidth="2.5" opacity=".55" />
    </g>
  );
}

function Scene({ id, children, bg }: { id: string; children: React.ReactNode; bg: string }) {
  return (
    <svg viewBox="0 0 400 330" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" style={{ display: "block" }}>
      <Defs id={id} />
      <rect width="400" height="330" fill={`url(#${bg}-${id})`} />
      {children}
    </svg>
  );
}

const A = [
  // 1: the moon who couldn't sleep
  () => (
    <Scene id="a1" bg="sky">
      <circle cx="200" cy="120" r="150" fill="url(#glow-a1)" />
      <image href="/art/moon.png" x="126" y="26" width="150" height="189" />
      {[[48, 44, 1, "#f7dc8f"], [330, 60, 1.1, "#cdbbe9"], [72, 150, .8, "#cdbbe9"], [352, 160, .9, "#f7dc8f"], [296, 26, .7, "#fff3c9"], [112, 18, .7, "#fff3c9"]].map(([x, y, s, c], i) => <Sparkle key={i} x={x as number} y={y as number} s={s as number} c={c as string} />)}
      <Cloud x={92} y={206} s={.8} o={.5} /><Cloud x={318} y={196} s={.7} o={.45} />
      <Rooftops y={246} />
      <text x="200" y="318" textAnchor="middle" fontFamily="Fraunces Variable, serif" fontStyle="italic" fontSize="15" fill="#f1d9e6" opacity=".9">…and nobody sang to him.</text>
    </Scene>
  ),
  // 2: Pip hears him
  () => (
    <Scene id="a2" bg="sky">
      {[[40, 40, 1], [360, 48, .9], [60, 230, .7], [345, 220, .8], [320, 120, .6]].map(([x, y, s], i) => <Sparkle key={i} x={x as number} y={y as number} s={s as number} c="#fff3c9" o={.85} />)}
      <Cloud x={70} y={236} s={.9} o={.55} /><Cloud x={338} y={250} s={.8} o={.5} />
      <Medallion id="a2" href="/art/pip-hero-clean.webp" w={250} h={304} x={75} y={14} />
      <image href="/art/moon.png" x="318" y="14" width="56" height="70" />
      <Rooftops y={262} />
    </Scene>
  ),
  // 3: the music box
  () => (
    <Scene id="a3" bg="rose">
      {[[44, 50, 1.1, "#e4b45a"], [356, 60, 1, "#e9a3b8"], [60, 232, .9, "#b8a2dd"], [346, 236, 1, "#e4b45a"]].map(([x, y, s, c], i) => <Sparkle key={i} x={x as number} y={y as number} s={s as number} c={c as string} />)}
      <g fontFamily="Fraunces Variable, serif" fill="#a34063" opacity=".8" fontSize="30"><text x="52" y="120">♪</text><text x="322" y="150" fontSize="38">♫</text><text x="84" y="228" fontSize="24">♬</text><text x="314" y="62" fontSize="22">♪</text></g>
      <Medallion id="a3" href="/art/unicorn.webp" w={236} h={252} x={82} y={14} />
      <path d="M0 296 Q100 270 200 292 T400 288 V330 H0Z" fill="#f4b8c6" opacity=".7" />
      <path d="M0 312 Q120 292 220 310 T400 306 V330 H0Z" fill="#e9a3b8" opacity=".8" />
    </Scene>
  ),
  // 4: the moon calms down
  () => (
    <Scene id="a4" bg="sky">
      <circle cx="200" cy="140" r="190" fill="url(#glow-a4)" />
      <Medallion id="a4" href="/art/lantern-moon.webp" w={290} h={259} x={55} y={10} />
      {[[44, 52, 1], [356, 44, 1.1], [58, 236, .8], [350, 232, .9], [318, 120, .6], [82, 128, .6]].map(([x, y, s], i) => <Sparkle key={i} x={x as number} y={y as number} s={s as number} c={i % 2 ? "#cdbbe9" : "#f7dc8f"} />)}
      <Cloud x={84} y={272} s={1} o={.8} /><Cloud x={316} y={278} s={1.1} o={.8} /><Cloud x={200} y={300} s={1.3} o={.9} />
    </Scene>
  ),
  // 5: goodnight
  () => (
    <Scene id="a5" bg="deep">
      <circle cx="200" cy="110" r="130" fill="url(#glow-a5)" opacity=".6" />
      <image href="/art/moon.png" x="140" y="34" width="120" height="151" />
      {[[50, 40, 1, "#cdbbe9"], [346, 60, 1, "#f7dc8f"], [76, 150, .8, "#f7dc8f"], [330, 160, .7, "#cdbbe9"], [290, 20, .7, "#fff3c9"], [120, 16, .6, "#fff3c9"]].map(([x, y, s, c], i) => <Sparkle key={i} x={x as number} y={y as number} s={s as number} c={c as string} />)}
      <g fontFamily="Fraunces Variable, serif" fontStyle="italic" fill="#f7dc8f" opacity=".9"><text x="268" y="70" fontSize="22">z</text><text x="288" y="48" fontSize="28">Z</text><text x="312" y="22" fontSize="34">Z</text></g>
      <Rooftops y={244} fill="#17102e" lit="#f7dc8f" windows={false} />
      <path d="M0 292 C30 270 56 270 80 290 C104 268 138 268 160 290 C186 266 224 266 244 290 C270 268 306 268 328 290 C350 272 380 270 400 288 V330 H0Z" fill="#cdbbe9" />
      <path d="M0 312 C30 294 60 294 84 312 C110 292 146 292 168 312 C196 290 234 292 256 312 C282 294 318 294 340 312 C362 296 386 296 400 308 V330 H0Z" fill="#fdf4f7" />
    </Scene>
  ),
];

export function StoryArt({ n }: { n: 1 | 2 | 3 | 4 | 5 }) {
  const C = A[n - 1]!;
  return <C />;
}
