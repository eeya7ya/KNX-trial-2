type LogoProps = {
  className?: string;
  variant?: "mark" | "stacked";
};

export function Logo({ className = "h-9 w-auto", variant = "mark" }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/KNX_logo.svg.png"
      alt="KNX Club Jordan"
      data-variant={variant}
      className={className}
      draggable={false}
    />
  );
}
