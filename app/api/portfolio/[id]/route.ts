import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Allow runtime fetches and avoid prerender issues
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

function notFound() {
  return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (isBuild) {
    return NextResponse.json({ data: null });
  }
  try {
    const item = await prisma.portfolioItem.findUnique({ where: { id: params.id } });
    if (!item) return notFound();
    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Error fetching portfolio item", error);
    return NextResponse.json({ error: "Failed to fetch portfolio item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (isBuild) {
    return NextResponse.json({ data: null });
  }
  try {
    const existing = await prisma.portfolioItem.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

    const body = await req.json();
    const { title, slug, type, description, imageUrl, demoUrl, isDemo } = body ?? {};

    const updated = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: {
        title: title ?? existing.title,
        slug: slug ?? existing.slug,
        type: type ?? existing.type,
        description: description ?? existing.description,
        imageUrl: imageUrl ?? existing.imageUrl,
        demoUrl: demoUrl ?? existing.demoUrl,
        isDemo: typeof isDemo === "boolean" ? isDemo : existing.isDemo,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("Error updating portfolio item", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (isBuild) {
    return NextResponse.json({ data: null });
  }
  try {
    const existing = await prisma.portfolioItem.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

    await prisma.portfolioItem.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id } });
  } catch (error) {
    console.error("Error deleting portfolio item", error);
    return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 });
  }
}
