import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anam Soft – Websites for beauty salons & spas in Vilnius",
  description:
    "Anam Soft builds modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients.",
  keywords: [
    "beauty salon website",
    "spa website",
    "Vilnius web designer",
    "salon booking website",
    "nail studio website",
    "hair studio website",
  ],
  openGraph: {
    title: "Anam Soft – Websites for beauty salons & spas in Vilnius",
    description:
      "Anam Soft builds modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients.",
    url: "https://anamsoft.com",
    siteName: "Anam Soft",
    type: "website",
    locale: "en_LT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anam Soft – Websites for beauty salons & spas in Vilnius",
    description:
      "Anam Soft builds modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={plusJakarta.className}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
