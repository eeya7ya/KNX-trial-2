import { renderIcon } from "@/lib/icon-image";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // iOS rounds the corners for us, so keep the mark off the edge.
  return renderIcon(180, { widthFraction: 0.84, gapFraction: 0.07 });
}
