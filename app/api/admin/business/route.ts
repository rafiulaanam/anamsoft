import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // If a business already exists, return it.
    const existing = await prisma.business.findFirst();
    if (existing) return NextResponse.json({ data: existing }, { status: 200 });

    const created = await prisma.business.create({ data: { ...body } });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("/api/admin/business POST error", err);
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const business = await prisma.business.findFirst();
    return NextResponse.json({ data: business }, { status: 200 });
  } catch (err) {
    console.error("/api/admin/business GET error", err);
    return NextResponse.json({ error: "Failed to fetch business" }, { status: 500 });
  }
}
