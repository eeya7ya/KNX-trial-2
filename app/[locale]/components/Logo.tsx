type LogoProps = {
  className?: string;
  variant?: "mark" | "stacked";
};

export function Logo({ className = "h-9 w-auto", variant = "mark" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
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
      <rect x="0" y="0" width="100" height="100" rx="20" fill="url(#knxLogoBg)" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Inter, Roboto, sans-serif"
        fontWeight="800"
        fontSize="34"
        letterSpacing="2"
      >
        KNX
      </text>
    </svg>
  );
}
