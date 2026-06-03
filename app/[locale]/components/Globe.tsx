"use client";

import { useEffect, useRef, useState } from "react";
import type { GlobeInstance } from "globe.gl";

/**
 * Realistic, auto-rotating 3D Earth for the homepage "About" section.
 *
 * Built on the open-source globe.gl library and textured with the project's
 * own day map + terrain bump (public/earth). three.js is dynamically imported
 * and only initialised once the section nears the viewport, so it never weighs
 * down the initial homepage load. A static earth image is shown until the live
 * globe is ready, and remains as the fallback if WebGL is unavailable.
 */
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
        const { default: Globe } = await import("globe.gl");
        if (cancelled || !container) return;

        const size = container.clientWidth;
        world = new Globe(container, { animateIn: true })
          .backgroundColor("rgba(0,0,0,0)")
          .globeImageUrl("/earth/albedo.jpg")
          .bumpImageUrl("/earth/bump.jpg")
          .showAtmosphere(true)
          .atmosphereColor("#8ec5ff")
          .atmosphereAltitude(0.16)
          .enablePointerInteraction(false) // let page scroll/touch pass through
          .width(size)
          .height(size)
          .onGlobeReady(() => {
            if (!cancelled) setReady(true);
          });

        world.pointOfView({ lat: 20, lng: 20, altitude: 2.4 });

        const controls = world.controls();
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = false;
        controls.autoRotate = !reduced;
        controls.autoRotateSpeed = 0.55;

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
      { rootMargin: "400px" },
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
    <div className="relative aspect-square w-full max-w-[440px]">
      {/* Static earth: shown while three.js loads, and as the no-WebGL fallback. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
      >
        <div className="relative aspect-square w-[88%]">
          <div
            className="absolute inset-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: "url(/earth/albedo.jpg)" }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.35), transparent 42%), radial-gradient(circle at 70% 74%, rgba(3,7,30,0.6), transparent 72%)",
              boxShadow: "inset -8px -12px 32px rgba(3,7,30,0.5)",
            }}
          />
        </div>
      </div>

      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}

export default Globe;
