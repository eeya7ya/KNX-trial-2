export function Logo({
  className = "h-9 w-auto",
  variant = "mark",
}: {
  className?: string;
  variant?: "mark" | "stacked";
}) {
  return (
    <img
      src="/knx-logo.svg"
      alt="KNX"
      className={className}
      data-variant={variant}
    />
  );
}
