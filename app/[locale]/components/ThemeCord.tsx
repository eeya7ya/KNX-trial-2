"use client";

import { useEffect, useRef, useState } from "react";

export type ThemeCordLabels = {
  toDark: string;
  toLight: string;
  hint: string;
};

/* ---- rope ---------------------------------------------------------------
   24 beads, verlet integration, distance constraints solved with alternating
   sweeps. The chain is inextensible and hangs straight; the swing, the stretch
   under a pull and the recoil on release all fall out of the physics rather
   than being keyframed. Units are viewBox units, not pixels — the SVG is
   scaled by CSS, so the cord shortens with it on small screens. */
const AX = 30;
const AY = -16;
const N = 24;
const L0 = 8;
const GRAV = 0.3;
const DAMP = 0.995;
const ITER = 6;
const SUB = 2;
const MAXPULL = 70; // how far past taut the chain will stretch, asymptotically
const THRESH = 26; // pull past this on release and the switch throws

const STORAGE_KEY = "knx-theme";
const SEEN_KEY = "knx-cord-seen";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeCord({ labels }: { labels: ThemeCordLabels }) {
  const cordRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const chainRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGPathElement>(null);
  const knobRef = useRef<SVGGElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  // Starts null so the server markup and the first client render agree; the
  // real value is read from the DOM (set by the boot script) after mount.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(currentTheme() === "dark");

    // Follow the OS while the visitor has not expressed a choice of their own.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch {
        /* storage unavailable — treat as "no choice saved" */
      }
      if (saved === "dark" || saved === "light") return;
      applyTheme(e.matches ? "dark" : "light");
      setIsDark(e.matches);
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  useEffect(() => {
    const cord = cordRef.current;
    const btn = btnRef.current;
    const svg = svgRef.current;
    const chain = chainRef.current;
    const halo = haloRef.current;
    const knob = knobRef.current;
    const hint = hintRef.current;
    if (!cord || !btn || !svg || !chain || !knob) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- show the hint once, to the first-time visitor only ---- */
    let hintTimer: ReturnType<typeof setTimeout> | null = null;
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage unavailable — don't nag */
    }
    if (!seen && hint) {
      hintTimer = setTimeout(() => hint.classList.add("is-shown"), 900);
    }
    function markSeen() {
      if (hintTimer) {
        clearTimeout(hintTimer);
        hintTimer = null;
      }
      hint?.classList.remove("is-shown");
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* nothing to do */
      }
    }

    /* ---- the swap ---- */
    function throwSwitch() {
      const next: Theme = currentTheme() === "dark" ? "light" : "dark";
      const r = knob!.getBoundingClientRect();
      commitTheme(next, {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      });
      setIsDark(next === "dark");
      clack(next === "light");
      markSeen();
    }

    if (reduce) {
      // No rope, no yank — the chain is drawn straight by the static markup and
      // the button behaves like any other toggle.
      const onClick = () => throwSwitch();
      btn.addEventListener("click", onClick);
      return () => {
        btn.removeEventListener("click", onClick);
        if (hintTimer) clearTimeout(hintTimer);
      };
    }

    /* ---- simulation state ---- */
    const pts: { x: number; y: number; px: number; py: number }[] = [];
    for (let i = 0; i < N; i++) {
      pts.push({ x: AX, y: AY + i * L0, px: AX, py: AY + i * L0 });
    }
    const last = pts[N - 1];

    let dragging = false;
    let pinX = 0;
    let pinY = 0;
    let restDist = (N - 1) * L0;

    function solve(j: number) {
      const a = pts[j];
      const b = pts[j + 1];
      const aFix = j === 0;
      const bFix = dragging && j + 1 === N - 1;
      if (aFix && bFix) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1e-4;
      const c = (d - L0) / d;
      const cx = dx * c;
      const cy = dy * c;
      if (aFix) {
        b.x -= cx;
        b.y -= cy;
      } else if (bFix) {
        a.x += cx;
        a.y += cy;
      } else {
        a.x += cx * 0.5;
        a.y += cy * 0.5;
        b.x -= cx * 0.5;
        b.y -= cy * 0.5;
      }
    }

    function step(wind: number) {
      for (let s = 0; s < SUB; s++) {
        for (let i = 1; i < N; i++) {
          if (dragging && i === N - 1) continue;
          const p = pts[i];
          const vx = (p.x - p.px) * DAMP;
          const vy = (p.y - p.py) * DAMP;
          p.px = p.x;
          p.py = p.y;
          p.x += vx + wind * (i / N);
          p.y += vy + GRAV;
        }
        if (dragging) {
          last.x = pinX;
          last.y = pinY;
        }
        for (let k = 0; k < ITER; k++) {
          if (k & 1) {
            for (let j = N - 2; j >= 0; j--) solve(j);
          } else {
            for (let j = 0; j < N - 1; j++) solve(j);
          }
        }
        pts[0].x = AX;
        pts[0].y = AY;
      }
    }

    // Let it settle, then record how far the bead naturally hangs. Everything
    // downstream (resistance, throw threshold) is measured against this.
    for (let w = 0; w < 400; w++) step(0);
    restDist = Math.hypot(last.x - AX, last.y - AY);

    function draw() {
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < N - 1; i++) {
        const p = pts[i];
        const q = pts[i + 1];
        d += ` Q${p.x.toFixed(1)} ${p.y.toFixed(1)} ${((p.x + q.x) / 2).toFixed(
          1,
        )} ${((p.y + q.y) / 2).toFixed(1)}`;
      }
      d += ` L${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
      chain!.setAttribute("d", d);
      halo?.setAttribute("d", d);

      const pv = pts[N - 2];
      const dx = last.x - pv.x;
      const dy = last.y - pv.y;
      const m = Math.hypot(dx, dy) || 1;
      const deg = (Math.atan2(-dx / m, dy / m) * 180) / Math.PI;
      knob!.setAttribute(
        "transform",
        `translate(${last.x.toFixed(1)} ${last.y.toFixed(1)}) rotate(${deg.toFixed(1)})`,
      );
    }
    draw();

    function tension() {
      return Math.hypot(last.x - AX, last.y - AY) - restDist;
    }

    /* ---- pointer ---- */
    function toSvg(e: PointerEvent) {
      const r = svg!.getBoundingClientRect();
      const vb = svg!.viewBox.baseVal;
      return {
        x: ((e.clientX - r.left) * vb.width) / r.width,
        y: ((e.clientY - r.top) * vb.height) / r.height,
      };
    }

    function setPin(x: number, y: number) {
      const dx = x - AX;
      const dy = y - AY;
      const raw = Math.hypot(dx, dy) || 1e-4;
      let d = raw;
      // Once the chain is taut it stops giving; the remaining travel decays so
      // it feels like a spring rather than a rubber band.
      if (raw > restDist) {
        d = restDist + MAXPULL * (1 - Math.exp(-(raw - restDist) / MAXPULL));
      }
      pinX = AX + (dx / raw) * d;
      pinY = AY + (dy / raw) * d;
      last.px = last.x; // keep the hand's velocity so the release recoils
      last.py = last.y;
      last.x = pinX;
      last.y = pinY;
    }

    let moved = false;
    let yankT = 0;
    let downX = 0;
    let downY = 0;
    let grabX = 0;
    let grabY = 0;

    function onPointerDown(e: PointerEvent) {
      const p = toSvg(e);
      dragging = true;
      moved = false;
      yankT = 0;
      downX = e.clientX;
      downY = e.clientY;
      grabX = last.x - p.x; // grab where you actually touched, no jump
      grabY = last.y - p.y;
      setPin(last.x, last.y);
      btn!.classList.add("is-grabbing");
      cord!.classList.add("is-grabbing");
      markSeen();
      try {
        btn!.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety, not a requirement */
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging || yankT) return;
      if (Math.abs(e.clientX - downX) > 4 || Math.abs(e.clientY - downY) > 4) {
        moved = true;
      }
      const p = toSvg(e);
      setPin(p.x + grabX, p.y + grabY);
    }

    function endDrag() {
      if (!dragging) return;
      const t = tension();
      dragging = false;
      btn!.classList.remove("is-grabbing");
      cord!.classList.remove("is-grabbing");
      if (moved && t > THRESH) throwSwitch();
    }

    // Tap, Enter or Space: yank it on their behalf, so a keyboard user sees the
    // same chain travel a mouse user does.
    function onClick() {
      if (moved) {
        moved = false;
        return;
      }
      dragging = true;
      yankT = performance.now();
    }

    btn.addEventListener("pointerdown", onPointerDown);
    btn.addEventListener("pointermove", onPointerMove);
    btn.addEventListener("pointerup", endDrag);
    btn.addEventListener("pointercancel", endDrag);
    btn.addEventListener("click", onClick);

    /* ---- loop ---- */
    let raf = 0;
    const start = performance.now();
    function frame(now: number) {
      if (yankT) {
        const e = (now - yankT) / 160;
        if (e >= 1) {
          yankT = 0;
          dragging = false;
          throwSwitch();
        } else {
          setPin(AX, AY + restDist + 54 * e * e);
        }
      }
      const t = (now - start) / 1000;
      step(
        dragging
          ? 0
          : 0.012 * Math.sin(t * 0.83) + 0.008 * Math.sin(t * 1.71 + 1.2),
      );
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (hintTimer) clearTimeout(hintTimer);
      btn.removeEventListener("pointerdown", onPointerDown);
      btn.removeEventListener("pointermove", onPointerMove);
      btn.removeEventListener("pointerup", endDrag);
      btn.removeEventListener("pointercancel", endDrag);
      btn.removeEventListener("click", onClick);
    };
  }, []);

  const label = isDark ? labels.toLight : labels.toDark;

  return (
    <div className="knx-cord" ref={cordRef}>
      <button
        type="button"
        ref={btnRef}
        className="knx-cord-pull"
        aria-pressed={isDark ?? false}
        aria-label={label}
        title={label}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 60 250"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id="knxCordGlow">
              <stop offset="0%" stopColor="#ffd79a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffd79a" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* the fitting the cord drops out of, sitting on the header's edge */}
          <rect
            className="knx-cord-mount"
            x="21"
            y="-4"
            width="18"
            height="5"
            rx="2.5"
          />
          {/* A wider copy of the chain in the opposite tone. Invisible against
              the page, it is what keeps the cord readable where it crosses the
              one high-contrast panel on the site. */}
          <path className="knx-cord-halo" ref={haloRef} d="M30 -16 L30 168" />
          <path className="knx-cord-chain" ref={chainRef} d="M30 -16 L30 168" />
          <g ref={knobRef} transform="translate(30 168)">
            <circle className="knx-cord-glow" cx="0" cy="14" r="34" fill="url(#knxCordGlow)" />
            <rect className="knx-cord-knob" x="-2" y="0" width="4" height="8" rx="2" />
            <ellipse className="knx-cord-knob" cx="0" cy="15" rx="5.5" ry="8.5" />
            <ellipse className="knx-cord-knob-hl" cx="-2" cy="11" rx="1.5" ry="2.6" />
          </g>
        </svg>
      </button>
      <p className="knx-cord-hint" ref={hintRef} aria-hidden="true">
        {labels.hint}
      </p>
    </div>
  );
}

/* ---- applying the theme -------------------------------------------------- */

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", next === "dark");
  root.style.colorScheme = next;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = next === "dark" ? "#0a0f0e" : "#ffffff";
}

type Origin = { x: number; y: number };

function commitTheme(next: Theme, origin: Origin) {
  const root = document.documentElement;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* the choice just won't survive the session */
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startViewTransition = (
    document as Document & {
      startViewTransition?: (cb: () => void) => {
        ready: Promise<void>;
        finished: Promise<void>;
      };
    }
  ).startViewTransition;

  if (reduce || typeof startViewTransition !== "function") {
    root.classList.add("knx-theme-fade");
    applyTheme(next);
    window.setTimeout(() => root.classList.remove("knx-theme-fade"), 500);
    return;
  }

  // Turning the lights ON grows the lit page over the dark one; turning them
  // OFF shrinks the lit page away to reveal the dark one already underneath.
  const turningOn = next === "light";
  root.classList.toggle("knx-lights-out", !turningOn);

  const vt = startViewTransition.call(document, () => applyTheme(next));

  vt.ready
    .then(() => {
      const { x, y } = origin;
      const r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      const from = `circle(0px at ${x}px ${y}px)`;
      const to = `circle(${r}px at ${x}px ${y}px)`;
      root.animate(
        { clipPath: turningOn ? [from, to] : [to, from] },
        {
          duration: 620,
          easing: "cubic-bezier(.65,0,.35,1)",
          pseudoElement: turningOn
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
        },
      );
    })
    .catch(() => {
      /* the transition was skipped; the class swap already happened */
    });

  vt.finished
    .catch(() => {})
    .finally(() => root.classList.remove("knx-lights-out"));
}

/* ---- the clack ----------------------------------------------------------
   A short filtered noise burst plus a falling body tone. Built on the fly so
   there is no audio asset to ship, and only ever triggered by a deliberate
   pull. */
let ac: AudioContext | null = null;

function clack(on: boolean) {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    ac = ac ?? new Ctor();
    if (ac.state === "suspended") void ac.resume();
    const t = ac.currentTime;

    const len = Math.floor(ac.sampleRate * 0.05);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = on ? 2700 : 1950;
    bp.Q.value = 1.3;
    const ng = ac.createGain();
    ng.gain.value = 0.13;
    src.connect(bp);
    bp.connect(ng);
    ng.connect(ac.destination);
    src.start(t);

    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(on ? 320 : 250, t);
    o.frequency.exponentialRampToValueAtTime(95, t + 0.05);
    g.gain.setValueAtTime(0.055, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g);
    g.connect(ac.destination);
    o.start(t);
    o.stop(t + 0.1);
  } catch {
    /* audio is decoration; never let it break the toggle */
  }
}
