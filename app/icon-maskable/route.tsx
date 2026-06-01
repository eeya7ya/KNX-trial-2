import { renderIcon } from "@/lib/icon-image";

export const runtime = "nodejs";

// Smaller logo so it stays within the Android adaptive-icon safe zone.
export function GET() {
  return renderIcon(512, { widthFraction: 0.64 });
}
