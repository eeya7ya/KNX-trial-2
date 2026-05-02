type LogoProps = {
  className?: string;
  variant?: "mark" | "stacked";
};

export function Logo({ className = "h-9 w-auto", variant = "mark" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 320 96"
      role="img"
      aria-label="KNX Club Jordan"
      className={className}
      data-variant={variant}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>KNX Club Jordan</title>
      <defs>
        <linearGradient id="knxLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00b070" />
          <stop offset="100%" stopColor="#007a4d" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="96" height="96" rx="20" fill="url(#knxLogoBg)" />
      <g fill="#ffffff">
        <rect x="22" y="22" width="8" height="52" rx="2" />
        <path d="M30 48 L48 22 H58 L40 48 L58 74 H48 L30 48 Z" />
        <path d="M62 22 L72 22 L72 74 L62 74 Z" opacity="0.95" />
      </g>

      <g fill="#0a0a0a" fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Inter, Roboto, sans-serif">
        <text x="112" y="50" fontSize="30" fontWeight="800" letterSpacing="2">KNX</text>
        <text x="112" y="74" fontSize="13" fontWeight="600" letterSpacing="3" fill="#525252">
          CLUB · JORDAN
        </text>
      </g>
    </svg>
  );
}
