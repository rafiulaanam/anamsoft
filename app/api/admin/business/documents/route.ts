import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const business = await prisma.business.findFirst();
    if (!business) return NextResponse.json({ data: [] });
    const documents = await prisma.businessDocument.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data: documents });
  } catch (err) {
    console.error("/api/admin/business/documents GET error", err);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.category) {
      return NextResponse.json({ error: "title and category required" }, { status: 400 });
    }

    const business = await prisma.business.findFirst();
    if (!business) return NextResponse.json({ error: "No business configured" }, { status: 400 });

    const doc = await prisma.businessDocument.create({
      data: {
        businessId: business.id,
        title: body.title,
        category: body.category,
        storageUrl: body.storageUrl,
        fileKey: body.fileKey,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        status: body.status,
        notes: body.notes,
      },
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (err) {
    console.error("/api/admin/business/documents POST error", err);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
