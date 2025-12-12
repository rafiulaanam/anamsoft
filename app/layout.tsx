import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

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
      <body className="font-sans">
        <ToastProvider>
          <AuthSessionProvider>
            {children}
          </AuthSessionProvider>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
