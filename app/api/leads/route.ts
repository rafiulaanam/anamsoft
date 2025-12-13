import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase() ?? null;
    const isReadParam = searchParams.get("isRead");

    const where: Record<string, unknown> = {};
    const allowedStatuses = ["NEW", "CONTACTED", "CALL_BOOKED", "PROPOSAL_SENT", "WON", "LOST"];
    if (status && allowedStatuses.includes(status)) {
      where.status = status;
    }
    if (isReadParam === "true") where.isRead = true;
    if (isReadParam === "false") where.isRead = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { salonName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: leads }, { status: 200 });
  } catch (error) {
    console.error("Error fetching leads", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body?.name as string | undefined)?.trim();
    const salonName = (body?.salonName as string | undefined)?.trim();
    const website = (body?.website as string | undefined)?.trim();
    const message = (body?.message as string | undefined)?.trim();

    if (!name || !salonName || !message) {
      return NextResponse.json(
        { error: "Name, salon name and message are required." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        salonName,
        website: website || null,
        message,
      },
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
