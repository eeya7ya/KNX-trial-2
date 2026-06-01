import { NextResponse } from "next/server";

// Admin installs as its own standalone app ("KNX Admin") scoped to /admin.
export function GET() {
  return NextResponse.json(
    {
      name: "KNX Admin",
      short_name: "KNX Admin",
      start_url: "/admin",
      scope: "/admin",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#0a0a0a",
      icons: [
        { src: "/icon-192", sizes: "192x192", type: "image/png" },
        { src: "/icon-512", sizes: "512x512", type: "image/png" },
        { src: "/icon-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
