import { renderIcon } from "@/lib/icon-image";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderIcon(180, { widthFraction: 0.86 });
}
