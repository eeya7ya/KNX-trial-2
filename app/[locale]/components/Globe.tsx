"use client";

import { useEffect, useRef, useState } from "react";
import type { GlobeInstance } from "globe.gl";

/**
 * Interactive "electrical" network globe for the homepage About section.
 *
 * A dark tech-styled Earth with dotted continents and glowing energy arcs
 * flowing between nodes (Amman, Jordan as the hub) — drag with the mouse to
 * spin it (smooth, damped), with a gentle idle auto-rotation. Built on the
 * open-source globe.gl library. three.js is dynamically imported and only
 * initialised once the section nears the viewport, keeping the initial
 * homepage bundle small. A static globe is shown until ready / if WebGL is
 * unavailable.
 */

const GREEN = "#19c37d";

const CITIES: { lat: number; lng: number }[] = [
  { lat: 31.95, lng: 35.93 }, // Amman (hub)
  { lat: 25.2, lng: 55.27 }, // Dubai
  { lat: 24.71, lng: 46.68 }, // Riyadh
  { lat: 30.04, lng: 31.24 }, // Cairo
  { lat: 41.0, lng: 28.98 }, // Istanbul
  { lat: 51.5, lng: -0.13 }, // London
  { lat: 52.52, lng: 13.4 }, // Berlin
  { lat: 48.86, lng: 2.35 }, // Paris
  { lat: 40.71, lng: -74.0 }, // New York
  { lat: 1.35, lng: 103.82 }, // Singapore
  { lat: 35.68, lng: 139.69 }, // Tokyo
  { lat: 19.08, lng: 72.88 }, // Mumbai
];

const HUB = CITIES[0];

const ARCS = [
  // Energy radiating from the Amman hub to the world.
  ...CITIES.slice(1).map((c) => ({
    startLat: HUB.lat,
    startLng: HUB.lng,
    endLat: c.lat,
    endLng: c.lng,
  })),
  // A few cross links so the network reads globally.
  { startLat: 51.5, startLng: -0.13, endLat: 40.71, endLng: -74.0 },
  { startLat: 25.2, startLng: 55.27, endLat: 1.35, endLng: 103.82 },
  { startLat: 52.52, startLng: 13.4, endLat: 35.68, endLng: 139.69 },
];

export function Globe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let world: GlobeInstance | null = null;
    let ro: ResizeObserver | null = null;
    let cancelled = false;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    async function init() {
      if (cancelled || !container) return;
      try {
        const [{ default: Globe }, geo] = await Promise.all([
          import("globe.gl"),
          fetch("/earth/countries.geojson").then((r) => r.json()),
        ]);
        if (cancelled || !container) return;

        const size = container.clientWidth;
        world = new Globe(container, { animateIn: true })
          .backgroundColor("rgba(0,0,0,0)")
          .showAtmosphere(true)
          .atmosphereColor(GREEN)
          .atmosphereAltitude(0.18)
          .hexPolygonsData(geo.features)
          .hexPolygonResolution(3)
          .hexPolygonMargin(0.3)
          .hexPolygonUseDots(true)
          .hexPolygonColor(() => "rgba(25, 195, 125, 0.55)")
          .hexPolygonAltitude(0.008)
          .arcsData(ARCS)
          .arcColor(() => [
            "rgba(25,195,125,0)",
            "rgba(125,255,205,0.95)",
            "rgba(25,195,125,0)",
          ])
          .arcStroke(0.5)
          .arcDashLength(0.4)
          .arcDashGap(0.6)
          .arcDashInitialGap(() => Math.random())
          .arcDashAnimateTime(2200)
          .arcAltitudeAutoScale(0.4)
          .pointsData(CITIES)
          .pointColor(() => GREEN)
          .pointAltitude(0.012)
          .pointRadius(0.34)
          .pointResolution(18)
          .width(size)
          .height(size)
          .onGlobeReady(() => {
            if (!cancelled) setReady(true);
          });

        // Dark, tech-styled globe surface so the green network glows.
        const mat = world.globeMaterial() as {
          color?: { set: (c: string) => void };
          emissive?: { set: (c: string) => void };
          emissiveIntensity?: number;
          shininess?: number;
        };
        mat.color?.set("#0a1a2b");
        mat.emissive?.set("#08131f");
        if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.35;
        if (mat.shininess !== undefined) mat.shininess = 6;

        world.pointOfView({ lat: 25, lng: 40, altitude: 2.4 });

        const controls = world.controls();
        controls.enableZoom = false; // let the page scroll instead of zooming
        controls.enablePan = false;
        controls.enableRotate = true; // drag with the mouse to spin
        controls.enableDamping = true; // smooth inertia (no jerky motion)
        controls.dampingFactor = 0.12;
        controls.rotateSpeed = 0.6;
        controls.autoRotate = !reduced;
        controls.autoRotateSpeed = 0.45;

        ro = new ResizeObserver(() => {
          if (!world || !container) return;
          const s = container.clientWidth;
          world.width(s).height(s);
        });
        ro.observe(container);
      } catch {
        // No WebGL / load failure — the static fallback stays visible.
      }
    }

    // Defer the heavy three.js bundle until the section approaches the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void init();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(container);

    return () => {
      cancelled = true;
      io.disconnect();
      ro?.disconnect();
      world?._destructor?.();
    };
  }, []);

  return (
    <div className="relative aspect-square w-full max-w-[460px] select-none">
      {/* Ambient green glow behind the globe. */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(25,195,125,0.18), transparent 68%)",
        }}
      />
      {/* Static globe shown while three.js loads and as the no-WebGL fallback. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
      >
        <div
          className="relative aspect-square w-[82%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 38%, #102a3a, #060d18 70%)",
            boxShadow:
              "0 0 60px rgba(25,195,125,0.22), inset -8px -12px 40px rgba(0,0,8,0.7)",
          }}
        />
      </div>

      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}

export default Globe;
