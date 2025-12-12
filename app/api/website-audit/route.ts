import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  WebsiteAuditPayload,
  sendWebsiteAuditConfirmationToClient,
  sendWebsiteAuditToAdmin,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, businessName, websiteUrl, businessType, mainProblems, notes } = body as {
      name?: string;
      email?: string;
      businessName?: string;
      websiteUrl?: string;
      businessType?: string;
      mainProblems?: string[];
      notes?: string;
    };

    if (!name || !email || !websiteUrl) {
      return NextResponse.json({ error: "Name, email and website URL are required." }, { status: 400 });
    }

    if (!Array.isArray(mainProblems) || mainProblems.length === 0) {
      return NextResponse.json({ error: "Please select at least one main problem." }, { status: 400 });
    }

    const payload: WebsiteAuditPayload = {
      name: name.trim(),
      email: email.trim(),
      businessName: businessName?.trim() || undefined,
      websiteUrl: websiteUrl.trim(),
      businessType: businessType?.trim() || undefined,
      mainProblems: mainProblems.map((p) => p.trim()),
      notes: notes?.trim() || undefined,
    };

    await prisma.websiteAudit.create({
      data: {
        name: payload.name,
        email: payload.email,
        businessName: payload.businessName,
        websiteUrl: payload.websiteUrl,
        businessType: payload.businessType,
        mainProblems: payload.mainProblems,
        notes: payload.notes,
        status: "NEW",
        source: "AUDIT",
      },
    });

    await sendWebsiteAuditToAdmin(payload);
    await sendWebsiteAuditConfirmationToClient(payload);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/website-audit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
