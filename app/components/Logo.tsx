export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="KNX Club Jordan"
      role="img"
    >
      <rect x="0" y="0" width="220" height="80" rx="10" fill="#00965e" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="800"
        fontSize="40"
        letterSpacing="6"
        fill="#ffffff"
      >
        KNX
      </text>
      <text
        x="50%"
        y="82%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="500"
        fontSize="10"
        letterSpacing="2"
        fill="#ffffff"
      >
        CLUB · JORDAN
      </text>
    </svg>
  );
}
