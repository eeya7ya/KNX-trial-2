type IconProps = { className?: string };

const base = "h-5 w-5";
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBolt({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className}>
      <path d="M13 2 L4 14 h7 l-1 8 9-12 h-7 l1-8 z" />
    </svg>
  );
}

export function IconUsers({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20 v-1 a5 5 0 0 1 5-5 h2 a5 5 0 0 1 5 5 v1" />
      <path d="M15 20 v-1 a4 4 0 0 1 4-4 h0 a3 3 0 0 1 3 3 v2" />
    </svg>
  );
}

export function IconShield({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className}>
      <path d="M12 3 l8 3 v6 c0 5-3.5 8.5-8 9 -4.5-.5-8-4-8-9 V6 l8-3 z" />
      <path d="M9 12 l2 2 4-4" />
    </svg>
  );
}

export function IconBook({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className}>
      <path d="M5 4 a2 2 0 0 1 2-2 h11 v18 H7 a2 2 0 0 0 -2 2 V4 z" />
      <path d="M5 20 a2 2 0 0 0 2 2 h11" />
      <path d="M9 7 h6 M9 11 h6" />
    </svg>
  );
}

export function IconBuilding({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className}>
      <path d="M3 21 V5 a2 2 0 0 1 2-2 h9 a2 2 0 0 1 2 2 v16" />
      <path d="M16 21 V11 h3 a2 2 0 0 1 2 2 v8" />
      <path d="M3 21 h18" />
      <path d="M7 8 h2 M7 12 h2 M7 16 h2 M11 8 h2 M11 12 h2 M11 16 h2" />
    </svg>
  );
}

export function IconBadge({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className}>
      <circle cx="12" cy="9" r="6" />
      <path d="M9 8 l2.5 2.5 L15 7" />
      <path d="M8.5 13.5 L7 22 l5-3 5 3 -1.5-8.5" />
    </svg>
  );
}

export function IconArrow({
  className = base,
  dir = "ltr",
}: IconProps & { dir?: "ltr" | "rtl" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth={2}
      className={className}
      style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M5 12 h14 M13 6 l6 6 -6 6" />
    </svg>
  );
}

export function IconCheck({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} className={className}>
      <path d="M5 12 l5 5 L20 7" />
    </svg>
  );
}
