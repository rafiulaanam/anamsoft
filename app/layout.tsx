import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnamSoftStudio – Websites for beauty salons & spas in Vilnius",
  description:
    "Modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius to drive more online bookings and loyal clients.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
