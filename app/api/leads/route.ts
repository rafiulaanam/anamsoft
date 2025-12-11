import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error("Error fetching leads", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, salonName, website, message } = body ?? {};

    if (!name || !salonName || !message) {
      return NextResponse.json({ error: "name, salonName, and message are required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        salonName,
        website: website ?? null,
        message,
      },
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
