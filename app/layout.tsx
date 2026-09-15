import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNIT Flight Deck",
  description:
    "Cockpit ADHD Growth Operator — CRM visuel, jauges de CA, centre de notifications et chrono 45/15.",
};

export const viewport: Viewport = {
  themeColor: "#0A0D12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
