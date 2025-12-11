import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function notFound() {
  return NextResponse.json({ error: "Lead not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

    const body = await req.json().catch(() => ({}));
    let { isRead } = body ?? {};

    if (typeof isRead !== "boolean") {
      isRead = !existing.isRead;
    }

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: { isRead },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating lead", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

    await prisma.lead.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id } });
  } catch (error) {
    console.error("Error deleting lead", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
