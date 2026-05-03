"use client";

import { useEffect, useRef, useState } from "react";

export type StatItem = { label: string; value: string };

function parseValue(value: string) {
  const match = value.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return { prefix: value, number: null as number | null, suffix: "" };
  const idx = match.index ?? 0;
  const numStr = match[0];
  return {
    prefix: value.slice(0, idx),
    number: parseFloat(numStr.replace(",", ".")),
    suffix: value.slice(idx + numStr.length),
  };
}

function useCountUp(target: number | null, start: boolean, duration: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start || target == null) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return n;
}

export function Stats({ items, className = "" }: { items: StatItem[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cols =
    items.length === 3
      ? "md:grid-cols-3"
      : items.length === 2
        ? "md:grid-cols-2"
        : items.length >= 5
          ? "md:grid-cols-5"
          : "md:grid-cols-4";

  return (
    <div
      ref={ref}
      role="list"
      className={`mx-auto grid w-full max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line ${cols} ${className}`}
    >
      {items.map((s, i) => (
        <StatCard
          key={s.label}
          stat={s}
          index={i}
          start={visible}
          active={active === i}
          onActivate={() => setActive((cur) => (cur === i ? null : i))}
        />
      ))}
    </div>
  );
}

function StatCard({
  stat,
  index,
  start,
  active,
  onActivate,
}: {
  stat: StatItem;
  index: number;
  start: boolean;
  active: boolean;
  onActivate: () => void;
}) {
  const parsed = parseValue(stat.value);
  const count = useCountUp(parsed.number, start, 900 + index * 120);
  const display =
    parsed.number == null ? stat.value : `${parsed.prefix}${count}${parsed.suffix}`;

  return (
    <button
      type="button"
      role="listitem"
      aria-pressed={active}
      onClick={onActivate}
      className={`group relative flex flex-col items-center justify-center gap-2 bg-white px-4 py-8 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-knx md:gap-3 md:py-12 ${
        active ? "bg-knx-50" : "hover:bg-knx-50/60"
      }`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-0.5 origin-center bg-knx transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
      <p
        className={`text-4xl font-extrabold tracking-tight text-ink transition-transform duration-300 md:text-5xl lg:text-6xl ${
          active ? "scale-110" : "group-hover:scale-105"
        }`}
      >
        {display}
      </p>
      <p className="text-sm text-ink-muted md:text-base">{stat.label}</p>
    </button>
  );
}
