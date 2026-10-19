"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { audio } from "@/lib/audio";

const SKULL = "#fbf4ea", PJ = "#f6e7c4", HAT = "#f3e6c9", POM = "#d9c3a0", PINK = "#f2a9bd", LILAC = "#cdbbe9", GOLD = "#e4b45a", CLOUD = "#fdf4f7";

/** soft 5-point star used for the hat print */
function starGeometry() {
  const s = new THREE.Shape(); const R = 1, r = 0.46;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + Math.PI / 2; const rad = i % 2 ? r : R; const x = Math.cos(a) * rad, y = Math.sin(a) * rad; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 });
}

function HatStars() {
  const geo = useMemo(starGeometry, []);
  const stars = useMemo(() => {
    const out: Array<{ p: THREE.Vector3; q: THREE.Quaternion; s: number }> = [];
    const seeds: Array<[number, number]> = [[0.5, 0.3], [1.6, 0.5], [2.7, 0.35], [3.8, 0.55], [4.9, 0.3], [5.8, 0.6], [1.0, 0.8], [2.2, 0.85], [3.3, 0.8], [4.4, 0.85], [5.3, 0.9], [0.1, 0.85]];
    seeds.forEach(([phi, th]) => {
      const n = new THREE.Vector3(Math.sin(th) * Math.cos(phi), Math.cos(th), Math.sin(th) * Math.sin(phi));
      out.push({ p: n.clone().multiplyScalar(0.935), q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), s: 0.105 });
    });
    return out;
  }, []);
  return <>{stars.map((st, i) => <mesh key={i} geometry={st.s ? geo : undefined} position={st.p} quaternion={st.q} scale={st.s}><meshStandardMaterial color={GOLD} roughness={0.55} /></mesh>)}</>;
}

/** drooping nightcap tail: overlapping spheres along a curve, tapering to a pom-pom */
function HatTail() {
  const parts = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.05, 0.78, 0), new THREE.Vector3(-0.3, 1.2, 0.02), new THREE.Vector3(-0.8, 1.32, 0.06), new THREE.Vector3(-1.22, 1.08, 0.08), new THREE.Vector3(-1.42, 0.62, 0.08)]);
    const n = 44; const arr: Array<{ p: THREE.Vector3; r: number }> = [];
    for (let i = 0; i <= n; i++) { const t = i / n; arr.push({ p: curve.getPoint(t), r: 0.42 * (1 - t) + 0.13 * t }); }
    return { arr, end: curve.getPoint(1) };
  }, []);
  return (
    <>
      {parts.arr.map((q, i) => <mesh key={i} position={q.p}><sphereGeometry args={[q.r, 24, 16]} /><meshStandardMaterial color={HAT} roughness={0.92} /></mesh>)}
      <mesh position={[parts.end.x - 0.02, parts.end.y - 0.14, parts.end.z]}><sphereGeometry args={[0.21, 28, 20]} /><meshStandardMaterial color={POM} roughness={1} /></mesh>
    </>
  );
}

function Pip({ night, sway }: { night: boolean; sway: boolean }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const wave = useRef(0);
  const squash = useRef(0);
  const hearts = useMemo(() => {
    const out: Array<{ p: THREE.Vector3; q: THREE.Quaternion }> = [];
    for (let i = 0; i < 14; i++) {
      const th = -1.15 + (i % 5) * 0.58 + (Math.floor(i / 5) % 2) * 0.28, ph = 1.35 + Math.floor(i / 5) * 0.42;
      const n = new THREE.Vector3(Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.sin(ph) * Math.cos(th)).normalize();
      out.push({ p: new THREE.Vector3(n.x * 0.75, -0.55 + n.y * 0.7, n.z * 0.62), q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n) });
    }
    return out;
  }, []);

  useEffect(() => {
    const onWave = () => { wave.current = 1.6; squash.current = 1; };
    window.addEventListener("pip:wave", onWave); return () => window.removeEventListener("pip:wave", onWave);
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime; const px = state.pointer.x, py = state.pointer.y;
    if (root.current) {
      root.current.position.y = Math.sin(t * 1.5) * 0.05;
      if (sway) root.current.rotation.y = Math.sin(t * 0.55) * 0.55;
      squash.current = Math.max(0, squash.current - dt * 2.2);
      const sq = Math.sin(squash.current * Math.PI) * 0.06; root.current.scale.set(1 + sq, 1 - sq, 1 + sq);
    }
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, px * 0.4, 0.08);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -py * 0.22, 0.08);
      head.current.rotation.z = Math.sin(t * 0.9) * 0.025;
    }
    [eyeL.current, eyeR.current].forEach((m, i) => {
      if (!m) return; const bx = i ? 0.38 : -0.38;
      m.position.x = THREE.MathUtils.lerp(m.position.x, bx + px * 0.07, 0.15);
      m.position.y = THREE.MathUtils.lerp(m.position.y, -0.04 + py * 0.06, 0.15);
    });
    wave.current = Math.max(0, wave.current - dt);
    if (arm.current) {
      const target = wave.current > 0 ? -2.25 + Math.sin(t * 15) * 0.32 : -0.55 + Math.sin(t * 1.5) * 0.04;
      arm.current.rotation.z = THREE.MathUtils.lerp(arm.current.rotation.z, target, 0.18);
    }
  });

  const onTap = () => { wave.current = 1.6; squash.current = 1; audio.giggle(); };

  return (
    <group ref={root} onClick={onTap} onPointerOver={() => { document.body.style.cursor = "grab"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
      {/* cloud seat */}
      <group position={[0, -1.55, 0]}>
        {[[0, 0.05, 0, 1.05, 1.5, 0.7, 1.2], [-1.05, -0.05, 0.1, 0.72, 1, 0.95, 1], [1.08, -0.02, 0.05, 0.74, 1, 0.95, 1], [-0.62, 0.15, 0.78, 0.62, 1, 0.9, 1], [0.58, 0.14, 0.8, 0.66, 1, 0.9, 1], [0.0, 0.12, -0.8, 0.7, 1.2, 0.9, 1], [-0.25, 0.42, 0.2, 0.55, 1, 0.8, 1], [0.35, 0.4, 0.1, 0.5, 1, 0.8, 1]].map(([x, y, z, r, sx, sy, sz], i) => (
          <mesh key={i} position={[x!, y!, z!]} scale={[sx!, sy!, sz!]}><sphereGeometry args={[r, 40, 28]} /><meshStandardMaterial color={CLOUD} roughness={1} emissive="#f6e3ee" emissiveIntensity={0.28} /></mesh>
        ))}
      </group>

      {/* pyjama body */}
      <mesh position={[0, -0.55, 0]} scale={[1, 0.95, 0.82]}><sphereGeometry args={[0.76, 48, 36]} /><meshStandardMaterial color={PJ} roughness={0.85} /></mesh>
      {hearts.map((h, i) => <mesh key={i} position={h.p} quaternion={h.q} scale={[0.07, 0.07, 0.016]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={PINK} roughness={0.9} /></mesh>)}
      {/* legs + feet */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.34, -0.95, 0.42]} rotation={[Math.PI / 2.4, 0, s * -0.12]}><capsuleGeometry args={[0.22, 0.36, 8, 20]} /><meshStandardMaterial color={PJ} roughness={0.85} /></mesh>
          <mesh position={[s * 0.4, -1.04, 0.82]} scale={[1, 0.7, 1.15]}><sphereGeometry args={[0.28, 28, 20]} /><meshStandardMaterial color={LILAC} roughness={0.8} /></mesh>
        </group>
      ))}
      {/* resting arm (image-left) */}
      <group position={[-0.7, -0.3, 0.1]} rotation={[0, 0, 0.55]}>
        <mesh position={[0, -0.28, 0]}><capsuleGeometry args={[0.15, 0.34, 8, 18]} /><meshStandardMaterial color={PJ} roughness={0.85} /></mesh>
        <mesh position={[0, -0.62, 0]}><sphereGeometry args={[0.17, 24, 18]} /><meshStandardMaterial color={SKULL} roughness={0.6} /></mesh>
      </group>
      {/* waving arm */}
      <group ref={arm} position={[0.7, -0.3, 0.1]} rotation={[0, 0, -0.55]}>
        <mesh position={[0, -0.28, 0]}><capsuleGeometry args={[0.15, 0.34, 8, 18]} /><meshStandardMaterial color={PJ} roughness={0.85} /></mesh>
        <mesh position={[0, -0.62, 0]}><sphereGeometry args={[0.17, 24, 18]} /><meshStandardMaterial color={SKULL} roughness={0.6} /></mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 0.72, 0]}>
        <mesh scale={[1.1, 1, 1]}><sphereGeometry args={[0.9, 64, 48]} /><meshPhysicalMaterial color={SKULL} roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.5} /></mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.38, -0.04, 0.77]} scale={[1.0, 1.12, 0.36]}><sphereGeometry args={[0.26, 32, 24]} /><meshStandardMaterial color="#3a2420" roughness={0.35} /></mesh>
        ))}
        <mesh ref={eyeL} position={[-0.38, -0.04, 0.9]}><sphereGeometry args={[0.058, 20, 16]} /><meshStandardMaterial color="#ffcf80" emissive="#ffa93c" emissiveIntensity={night ? 1.7 : 0.9} /></mesh>
        <mesh ref={eyeR} position={[0.38, -0.04, 0.9]}><sphereGeometry args={[0.058, 20, 16]} /><meshStandardMaterial color="#ffcf80" emissive="#ffa93c" emissiveIntensity={night ? 1.7 : 0.9} /></mesh>
        <mesh position={[0, -0.33, 0.855]} scale={[1.1, 1.4, 0.7]}><sphereGeometry args={[0.048, 16, 12]} /><meshStandardMaterial color="#6a4a40" roughness={0.6} /></mesh>
        <mesh position={[0.02, -0.5, 0.745]} rotation={[0, 0, Math.PI + 0.12]}><torusGeometry args={[0.15, 0.02, 10, 28, Math.PI]} /><meshStandardMaterial color="#6a4a40" roughness={0.6} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.64, -0.3, 0.6]} rotation={[0, s * 0.85, 0]} scale={[1, 0.72, 0.22]}><sphereGeometry args={[0.17, 24, 18]} /><meshStandardMaterial color="#f4a7b8" roughness={0.9} transparent opacity={0.82} /></mesh>)}
        {/* nightcap: cap + brim + drooping tail + pom-pom + bow */}
        <group rotation={[-0.1, 0, 0.08]} scale={[1.1, 1, 1]}>
          <mesh><sphereGeometry args={[0.935, 64, 40, 0, Math.PI * 2, 0, 1.0]} /><meshStandardMaterial color={HAT} roughness={0.92} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, Math.cos(1.0) * 0.935, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[Math.sin(1.0) * 0.935, 0.105, 20, 72]} /><meshStandardMaterial color="#f8eed6" roughness={0.95} /></mesh>
          <HatStars />
          <HatTail />
          <group position={[-0.62, 0.55, 0.62]} rotation={[0.1, 0.62, 0.35]} scale={[1 / 1.1, 1, 1]}>
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.14, 0.3, 20]} /><meshStandardMaterial color={PINK} roughness={0.7} /></mesh>
            <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.14, 0.3, 20]} /><meshStandardMaterial color={PINK} roughness={0.7} /></mesh>
            <mesh><sphereGeometry args={[0.075, 18, 14]} /><meshStandardMaterial color="#e68aa3" roughness={0.7} /></mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function Sprites() {
  const [moon, gold, lav] = useLoader(THREE.TextureLoader, ["/art/moon.png", "/art/star-gold.png", "/art/star-lav.png"]);
  const spr = (map: THREE.Texture, pos: [number, number, number], s: number, spd = 1) => (
    <Float speed={spd} floatIntensity={0.8} rotationIntensity={0}><sprite position={pos} scale={[s, s * (map === moon ? 1.25 : 1), 1]}><spriteMaterial map={map} transparent toneMapped={false} depthWrite={false} /></sprite></Float>
  );
  return <>{spr(moon, [1.95, 1.7, -0.6], 1.15, 0.8)}{spr(gold, [-1.9, 1.5, -0.2], 0.45, 1.2)}{spr(lav, [-2.1, -0.2, 0.2], 0.4, 1)}{spr(gold, [2.1, 0.1, 0.3], 0.38, 1.4)}{spr(lav, [1.4, -1.1, 0.6], 0.3, 0.9)}</>;
}

export default function Pip3D({ night, active }: { night: boolean; active: boolean }) {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => { setCoarse(window.matchMedia("(pointer: coarse)").matches); }, []);
  return (
    <Canvas camera={{ position: [0, 0.55, 8.4], fov: 36 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} frameloop={active ? "always" : "never"} style={{ touchAction: "pan-y" }}>
      <hemisphereLight args={["#fff1e0", "#cdbbe9", night ? 0.7 : 1.05]} />
      <directionalLight position={[3, 4, 5]} intensity={night ? 1.1 : 1.7} color="#fff3dc" />
      <directionalLight position={[-4, 2, -2]} intensity={0.55} color="#cdbbe9" />
      <pointLight position={[0, 0.8, 2.2]} intensity={night ? 6 : 1.2} color="#ffc766" distance={7} />
      <Pip night={night} sway={coarse} />
      <Sprites />
      <ContactShadows position={[0, -2.05, 0]} opacity={0.35} scale={7} blur={2.6} far={3} color="#2b2147" />
      {!coarse && <OrbitControls target={[0, 0.0, 0]} enableZoom={false} enablePan={false} minPolarAngle={1.1} maxPolarAngle={1.95} autoRotate autoRotateSpeed={0.7} rotateSpeed={0.8} />}
    </Canvas>
  );
}
