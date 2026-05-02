import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KNX Club Jordan",
  description:
    "The Jordanian KNX Club — a community for KNX professionals, integrators, and enthusiasts in Jordan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
