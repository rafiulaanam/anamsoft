import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

export async function GET() {
  if (isBuild) return NextResponse.json({ data: [] });
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: services });
  } catch (error) {
    console.error("Error fetching services", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (isBuild) return NextResponse.json({ data: null });
  try {
    const body = await req.json();
    const { name, slug, description, priceFrom, isFeatured } = body ?? {};

    if (!name || !slug || !description) {
      return NextResponse.json({ error: "name, slug, and description are required" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description,
        priceFrom: priceFrom ?? null,
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ data: service }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating service", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
