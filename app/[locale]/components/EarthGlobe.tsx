"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const TEX = {
  albedo: "/earth/albedo.jpg",
  bump: "/earth/bump.jpg",
  clouds: "/earth/clouds.jpg",
  ocean: "/earth/ocean.jpg",
};

/* ------------------------------------------------------------------ *
 * Static CSS globe — used as the loading placeholder, the reduced-
 * motion view, and the graceful fallback when WebGL is unavailable.
 * ------------------------------------------------------------------ */
function StaticGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 grid place-items-center ${className}`}>
      <div className="relative aspect-square w-[82%]">
        {/* atmosphere glow */}
        <div
          aria-hidden
          className="absolute inset-[-12%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(99,160,255,0.35), rgba(99,160,255,0.10) 60%, transparent 72%)",
            filter: "blur(2px)",
          }}
        />
        {/* the planet */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${TEX.albedo})` }}
        />
        {/* spherical shading */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 30%, rgba(255,255,255,0.35), transparent 38%), radial-gradient(circle at 68% 72%, rgba(0,0,20,0.85), transparent 70%)",
            boxShadow: "inset -10px -16px 40px rgba(0,0,20,0.85)",
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Atmosphere — additive fresnel rim glow on an oversized shell.
 * ------------------------------------------------------------------ */
const ATMOSPHERE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const ATMOSPHERE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vView)), uPower);
    gl_FragColor = vec4(uColor, rim * uIntensity);
  }
`;

function Atmosphere() {
  const uniforms = useRef({
    uColor: { value: new THREE.Color("#5b9dff") },
    uPower: { value: 3.0 },
    uIntensity: { value: 1.15 },
  });
  return (
    <mesh scale={1.16}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={ATMOSPHERE_VERT}
        fragmentShader={ATMOSPHERE_FRAG}
        uniforms={uniforms.current}
        transparent
        side={THREE.FrontSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * The planet itself.
 * ------------------------------------------------------------------ */
function Earth({
  reducedMotion,
  pausedRef,
  onReady,
}: {
  reducedMotion: boolean;
  pausedRef: RefObject<boolean>;
  onReady: () => void;
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [albedo, bump, clouds, ocean] = useLoader(THREE.TextureLoader, [
    TEX.albedo,
    TEX.bump,
    TEX.clouds,
    TEX.ocean,
  ]);

  useEffect(() => {
    albedo.colorSpace = THREE.SRGBColorSpace;
    for (const t of [albedo, bump, clouds, ocean]) {
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    onReady();
  }, [albedo, bump, clouds, ocean, onReady]);

  useFrame((_, delta) => {
    if (reducedMotion || pausedRef.current) return;
    const d = Math.min(delta, 0.05); // clamp after tab refocus
    if (earthRef.current) earthRef.current.rotation.y += d * 0.06;
    if (cloudRef.current) cloudRef.current.rotation.y += d * 0.085;
  });

  return (
    <group rotation={[0.3, 0, 0.08]}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          map={albedo}
          bumpMap={bump}
          bumpScale={0.035}
          roughnessMap={ocean}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh ref={cloudRef} scale={1.012}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          alphaMap={clouds}
          transparent
          opacity={0.85}
          depthWrite={false}
          color="#ffffff"
          roughness={1}
          metalness={0}
        />
      </mesh>
      <Atmosphere />
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Error boundary so a missing WebGL context never breaks the page.
 * ------------------------------------------------------------------ */
class WebGLBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ------------------------------------------------------------------ *
 * Public component.
 * ------------------------------------------------------------------ */
export function EarthGlobe() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onMq);

    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="relative aspect-square w-full max-w-[460px] select-none">
      {/* Deep-space backdrop so the planet, its night side and the additive
          atmosphere glow read against the light page (additive blending is
          invisible over white). Fades to transparent — no hard edge. */}
      <div
        aria-hidden
        className="absolute inset-[-6%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, #0b1736 0%, #0a1024 46%, rgba(10,16,36,0) 78%)",
        }}
      />

      {/* Placeholder / fallback sits behind the canvas and fades out once 3D is ready */}
      <div
        className="transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
      >
        <StaticGlobe />
      </div>

      {mounted && (
        <WebGLBoundary fallback={<StaticGlobe />}>
          <Canvas
            className="!absolute inset-0"
            camera={{ position: [0, 0, 3.1], fov: 42 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.35} />
            <directionalLight position={[3, 1.5, 2.5]} intensity={2.4} />
            <Earth
              reducedMotion={reducedMotion}
              pausedRef={pausedRef}
              onReady={() => setReady(true)}
            />
          </Canvas>
        </WebGLBoundary>
      )}
    </div>
  );
}

export default EarthGlobe;
