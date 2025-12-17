import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedStatuses = Object.values(LeadStatus);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { leadStatus, unread, notes } = body ?? {};

    const data: Record<string, unknown> = {};
    if (typeof leadStatus === "string") {
      if (!allowedStatuses.includes(leadStatus as LeadStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.leadStatus = leadStatus;
    }
    if (typeof unread === "boolean") {
      data.unread = unread;
    }
    if (typeof notes === "string" || notes === null) {
      data.notes = notes ?? null;
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ data: null });
    }

    const lead = await prisma.lead.update({ where: { id: params.id }, data });
    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${params.id}`);
    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error("Error updating lead", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.lead.delete({ where: { id: params.id } });
    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
