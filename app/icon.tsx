import { renderIcon } from "@/lib/icon-image";

export const runtime = "nodejs";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return renderIcon(512, { widthFraction: 0.84 });
}
