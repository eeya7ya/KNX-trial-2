import { renderIcon } from "@/lib/icon-image";

export const runtime = "nodejs";

export function GET() {
  return renderIcon(512, { widthFraction: 0.84 });
}
