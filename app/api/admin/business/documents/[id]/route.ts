import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await req.json();

    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.category !== undefined) data.category = body.category;
    if (body.storageUrl !== undefined) data.storageUrl = body.storageUrl;
    if (body.issueDate !== undefined) data.issueDate = body.issueDate ? new Date(body.issueDate) : null;
    if (body.expiryDate !== undefined) data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;

    const updated = await prisma.businessDocument.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("/api/admin/business/documents/[id] PATCH error", err);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    await prisma.businessDocument.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    console.error("/api/admin/business/documents/[id] DELETE error", err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
