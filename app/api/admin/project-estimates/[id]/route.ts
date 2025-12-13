import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {

  try {
    const { prisma } = await import("@/lib/db");
    const { id } = params;
    const body = await req.json();
    const { status, notes } = body ?? {};

    const data: Record<string, any> = {};
    if (typeof status === "string") {
      data.status = status;
    }
    if (typeof notes === "string") {
      data.notes = notes;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const updated = await prisma.projectEstimate.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating project estimate", error);
    return NextResponse.json({ error: "Failed to update project estimate" }, { status: 500 });
  }
}
