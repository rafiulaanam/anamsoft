import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  WebsiteAuditPayload,
  sendWebsiteAuditConfirmationToClient,
  sendWebsiteAuditToAdmin,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

export async function POST(req: NextRequest) {
  if (isBuild) {
    return NextResponse.json({ success: true }, { status: 200 });
  }
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

    const mainGoalText =
      mainProblems && Array.isArray(mainProblems) && mainProblems.length > 0 ? mainProblems.join(", ") : "Not specified";

    await prisma.websiteAudit.create({
      data: {
        name: payload.name,
        email: payload.email,
        websiteUrl: payload.websiteUrl,
        businessType: payload.businessType,
        mainGoal: mainGoalText,
        message: payload.notes,
        notes: payload.notes,
        status: "NEW",
      },
    });

    await sendWebsiteAuditToAdmin(payload).catch((err) =>
      console.error("Audit admin email failed", err)
    );
    await sendWebsiteAuditConfirmationToClient(payload).catch((err) =>
      console.error("Audit client email failed", err)
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/website-audit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
