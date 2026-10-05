import type { Metadata } from "next";
import "./globals.css";
import "./journey.css";

export const metadata: Metadata = {
  title: "Rathy Baiju | Celebrity & Bridal Makeup Artist · Kochi",
  description: "Beauty, artfully revealed. Bridal makeup and hairstyling by Rathy Baiju. Certified at Pattanam Designory. Kochi and worldwide.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
