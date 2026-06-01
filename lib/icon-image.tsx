import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Intrinsic dimensions of public/KNX_logo.svg.png (1920 x 916 -> ~2.1:1).
const LOGO_RATIO = 916 / 1920;

let cachedLogo: string | null = null;
async function logoDataUrl(): Promise<string> {
  if (cachedLogo) return cachedLogo;
  const buf = await readFile(join(process.cwd(), "public", "KNX_logo.svg.png"));
  cachedLogo = `data:image/png;base64,${buf.toString("base64")}`;
  return cachedLogo;
}

/**
 * Render the KNX logo centered inside a square tile so it never looks
 * "shrunk" with uneven white bands. `widthFraction` controls how much of
 * the tile width the (wide) logo occupies; use a smaller value for
 * maskable icons so the logo stays inside the adaptive-icon safe zone.
 */
export async function renderIcon(
  size: number,
  opts: { widthFraction?: number; background?: string } = {},
): Promise<ImageResponse> {
  const { widthFraction = 0.84, background = "#ffffff" } = opts;
  const src = await logoDataUrl();
  const imgW = Math.round(size * widthFraction);
  const imgH = Math.round(imgW * LOGO_RATIO);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={imgW} height={imgH} alt="KNX" />
      </div>
    ),
    { width: size, height: size },
  );
}
