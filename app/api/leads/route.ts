import { prisma } from "@/lib/db";
import { sendLeadConfirmationEmail, sendLeadNotificationEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import type { LeadStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as LeadStatus | null;
    const search = searchParams.get("search")?.toLowerCase() ?? null;
    const isReadParam = searchParams.get("isRead");

    const where: any = {};
    if (status && ["NEW", "CONTACTED", "CALL_BOOKED", "PROPOSAL_SENT", "WON", "LOST"].includes(status)) {
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
    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error("Error fetching leads", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body?.name as string | undefined)?.trim();
    const salonName = (body?.salonName as string | undefined)?.trim();
    const email = (body?.email as string | undefined)?.trim();
    const website = (body?.website as string | undefined)?.trim();
    const message = (body?.message as string | undefined)?.trim();

    if (!name || !salonName || !email || !message) {
      return NextResponse.json({ error: "Name, salon name, email and message are required." }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        salonName,
        email,
        website: website || null,
        message,
        status: "NEW",
      },
    });

    try {
      await sendLeadNotificationEmail(lead);
      await sendLeadConfirmationEmail({ name: lead.name, salonName: lead.salonName, email: lead.email });
    } catch (err) {
      console.error("Error sending lead emails", err);
    }

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
