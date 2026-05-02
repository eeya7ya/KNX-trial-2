type IconProps = { className?: string };

const base = "h-5 w-5";

export function IconBolt({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUsers({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M16 11a4 4 0 100-8 4 4 0 000 8zM8 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a5 5 0 015-5h2a5 5 0 015 5v1M14 21v-1a5 5 0 015-5h0a3 3 0 013 3v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShield({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBook({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5z" strokeLinejoin="round" />
      <path d="M8 7h6M8 11h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconBuilding({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M3 21V5a2 2 0 012-2h9a2 2 0 012 2v16M16 21V11h3a2 2 0 012 2v8M3 21h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8h2M7 12h2M7 16h2" strokeLinecap="round" />
    </svg>
  );
}

export function IconBadge({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrow({ className = base, dir = "ltr" }: IconProps & { dir?: "ltr" | "rtl" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
