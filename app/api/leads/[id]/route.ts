import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { LeadStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, isRead, notes } = body ?? {};

    const data: Record<string, unknown> = {};
    if (typeof status === "string") {
      const allowed: LeadStatus[] = ["NEW", "CONTACTED", "CALL_BOOKED", "PROPOSAL_SENT", "WON", "LOST"];
      if (!allowed.includes(status as LeadStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = status as LeadStatus;
    }
    if (typeof isRead === "boolean") {
      data.isRead = isRead;
    }
    if (typeof notes === "string" || notes === null) {
      data.notes = notes ?? null;
    }

    const lead = await prisma.lead.update({ where: { id: params.id }, data });
    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error("Error updating lead", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.lead.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
