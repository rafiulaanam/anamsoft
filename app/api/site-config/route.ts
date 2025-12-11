import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const defaultConfig = {
  heroTitle: "Websites for beauty salons & spas in Vilnius",
  heroSubtitle:
    "At Anam Soft, I build modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients.",
  email: "hello@anamsoft.com",
  whatsapp: "+370 611 04553",
};

export async function GET() {
  try {
    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      config = await prisma.siteConfig.create({ data: defaultConfig });
    }
    return NextResponse.json({ data: config });
  } catch (error) {
    console.error("Error fetching site config", error);
    return NextResponse.json({ error: "Failed to fetch site config" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { heroTitle, heroSubtitle, email, whatsapp } = body ?? {};

    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          ...defaultConfig,
          heroTitle: heroTitle ?? defaultConfig.heroTitle,
          heroSubtitle: heroSubtitle ?? defaultConfig.heroSubtitle,
          email: email ?? defaultConfig.email,
          whatsapp: whatsapp ?? defaultConfig.whatsapp,
        },
      });
      return NextResponse.json({ data: config });
    }

    const updated = await prisma.siteConfig.update({
      where: { id: config.id },
      data: {
        heroTitle: heroTitle ?? config.heroTitle,
        heroSubtitle: heroSubtitle ?? config.heroSubtitle,
        email: email ?? config.email,
        whatsapp: whatsapp ?? config.whatsapp,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating site config", error);
    return NextResponse.json({ error: "Failed to update site config" }, { status: 500 });
  }
}

export const PUT = PATCH;
