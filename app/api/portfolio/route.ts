import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

export async function GET() {
  if (isBuild) {
    return NextResponse.json({ data: [] });
  }
  try {
    const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("Error fetching portfolio items", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (isBuild) {
    return NextResponse.json({ data: null });
  }
  try {
    const body = await req.json();
    const { title, slug, type, description, imageUrl, demoUrl, isDemo } = body ?? {};

    if (!title || !slug || !type || !description) {
      return NextResponse.json({ error: "title, slug, type, and description are required" }, { status: 400 });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title,
        slug,
        type,
        description,
        imageUrl: imageUrl ?? null,
        demoUrl: demoUrl ?? null,
        isDemo: typeof isDemo === "boolean" ? isDemo : true,
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating portfolio item", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
  }
}
