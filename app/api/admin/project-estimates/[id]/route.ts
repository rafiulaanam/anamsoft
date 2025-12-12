import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // During static build (or on Vercel build), avoid DB calls so the build completes.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return NextResponse.json({ data: null }, { status: 200 });
  }

  try {
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
