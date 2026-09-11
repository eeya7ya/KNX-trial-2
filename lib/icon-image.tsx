import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * public/KNX_logo.svg.png is 1920 x 916 — a ~2.1:1 lockup. Dropped whole into a
 * square tile it can only ever fill about 45% of the height, which is why the
 * favicon read as a small smudge in a browser tab and in search results.
 *
 * The mark has a clean fully-transparent band between the arc and the letters
 * (rows 370-397), so for square formats we cut there and re-stack the two
 * halves with room to breathe. Same artwork, same proportions within each
 * half — it just stops pretending a wide lockup fits a square.
 */
const LOGO_W = 1920;
const LOGO_H = 916;
const ARC_TOP = 9;
const ARC_BOTTOM = 369; // last row of the arc
const LETTERS_TOP = 398; // first row of "KNX"
const LETTERS_BOTTOM = 906;

const ARC_H = ARC_BOTTOM - ARC_TOP + 1;
const LETTERS_H = LETTERS_BOTTOM - LETTERS_TOP + 1;

let cachedLogo: string | null = null;
async function logoDataUrl(): Promise<string> {
  if (cachedLogo) return cachedLogo;
  const buf = await readFile(join(process.cwd(), "public", "KNX_logo.svg.png"));
  cachedLogo = `data:image/png;base64,${buf.toString("base64")}`;
  return cachedLogo;
}

export type IconOptions = {
  /** Share of the tile width the mark spans. */
  widthFraction?: number;
  /** Vertical air between the arc and the letters, as a share of the tile. */
  gapFraction?: number;
  background?: string;
};

/**
 * Render the KNX mark as a square tile: the arc above, "KNX" below, the pair
 * optically centred.
 */
export async function renderIcon(
  size: number,
  opts: IconOptions = {},
): Promise<ImageResponse> {
  const {
    widthFraction = 0.92,
    gapFraction = 0.075,
    background = "#ffffff",
  } = opts;

  const src = await logoDataUrl();

  const markW = Math.round(size * widthFraction);
  const scale = markW / LOGO_W;
  const fullH = Math.round(LOGO_H * scale);
  const arcH = Math.round(ARC_H * scale);
  const lettersH = Math.round(LETTERS_H * scale);
  const gap = Math.round(size * gapFraction);

  // Each half is a fixed-size window onto the same image, slid up so the wanted
  // band lands inside it.
  const band = (offset: number, height: number) => (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: `${markW}px`,
        height: `${height}px`,
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        width={markW}
        height={fullH}
        alt=""
        style={{ position: "absolute", left: 0, top: `${-offset}px` }}
      />
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background,
        }}
      >
        {band(Math.round(ARC_TOP * scale), arcH)}
        <div style={{ display: "flex", height: `${gap}px` }} />
        {band(Math.round(LETTERS_TOP * scale), lettersH)}
      </div>
    ),
    { width: size, height: size },
  );
}
