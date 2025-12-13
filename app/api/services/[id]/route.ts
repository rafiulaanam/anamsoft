import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

function notFound() {
  return NextResponse.json({ error: "Service not found" }, { status: 404 });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (isBuild) return NextResponse.json({ data: null });
  try {
    if (!(prisma as any)?.service) {
      throw new Error("Service model unavailable");
    }
    const service = await prisma.service.findUnique({ where: { id: params.id } });
    if (!service) return notFound();
    return NextResponse.json({ data: service });
  } catch (error) {
    console.error("Error fetching service", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (isBuild) return NextResponse.json({ data: null });
  try {
    if (!(prisma as any)?.service) {
      throw new Error("Service model unavailable");
    }
    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

    const body = await req.json();
    const { name, description, priceFrom, isFeatured, slug } = body ?? {};

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: {
        name: name ?? existing.name,
        description: description ?? existing.description,
        priceFrom: priceFrom ?? existing.priceFrom,
        isFeatured: typeof isFeatured === "boolean" ? isFeatured : existing.isFeatured,
        slug: slug ?? existing.slug,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("Error updating service", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (isBuild) return NextResponse.json({ data: null });
  try {
    if (!(prisma as any)?.service) {
      throw new Error("Service model unavailable");
    }
    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

    await prisma.service.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id } });
  } catch (error) {
    console.error("Error deleting service", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
