import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "KNX Club Jordan — smart buildings, open standard, one community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public", "KNX_logo.svg.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const tagline = "Smart buildings · open standard · one community";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px",
          background: "linear-gradient(135deg, #064e34 0%, #00965e 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: "#ffffff",
              borderRadius: "28px",
              padding: "26px 34px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={188} height={90} alt="KNX" />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "92px", fontWeight: 700, lineHeight: 1.02 }}>
            KNX Club Jordan
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 500,
              color: "#d1fae5",
              marginTop: "18px",
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "30px",
            color: "#a7f3d0",
          }}
        >
          <div style={{ display: "flex" }}>knx-jordan-club.com</div>
          <div style={{ display: "flex" }}>Amman · Jordan</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
