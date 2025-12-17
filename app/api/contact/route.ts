import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ContactLeadPayload,
  sendContactLeadConfirmationEmail,
  sendContactLeadEmailToAdmin,
} from "@/lib/email";
import { revalidatePath } from "next/cache";

type ContactBody = {
  name?: string;
  fullName?: string;
  email?: string;
  businessName?: string;
  websiteUrl?: string;
  budgetRange?: string;
  reason?: string;
  message?: string;
  howHeard?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactBody;
    const fullName = (body.fullName ?? body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: "Full name, email, and message are required." },
        { status: 400 }
      );
    }

    const payload: ContactLeadPayload = {
      name: fullName,
      email,
      businessName: body.businessName?.trim() || undefined,
      websiteUrl: body.websiteUrl?.trim() || undefined,
      budgetRange: body.budgetRange?.trim() || undefined,
      reason: body.reason?.trim() || undefined,
      howHeard: body.howHeard?.trim() || undefined,
      message,
    };

    const data: any = {
      fullName,
      salonName: payload.businessName || "Contact",
      email: payload.email,
      website: payload.websiteUrl || null,
      message: payload.message,
      status: "NEW",
    };

    const extras: string[] = [];
    if (payload.budgetRange) extras.push(`Budget: ${payload.budgetRange}`);
    if (payload.reason) extras.push(`Reason: ${payload.reason}`);
    if (payload.howHeard) extras.push(`How heard: ${payload.howHeard}`);
    if (extras.length) {
      data.notes = extras.join(" | ");
    }
    if ((prisma as any).lead?.fields?.source || (prisma as any).lead?.FieldRef?.source) {
      data.source = "CONTACT";
    }

    let leadId: string;
    try {
      const lead = await prisma.lead.create({ data });
      leadId = lead.id;
      console.info("Contact lead persisted", {
        leadId,
        fullName,
        email,
      });
    } catch (error) {
      console.error("Contact lead create failed", error);
      return NextResponse.json(
        { ok: false, error: "Failed to save contact lead." },
        { status: 500 }
      );
    }

    revalidatePath("/admin/leads");

    let siteConfig = null;
    try {
      siteConfig = (prisma as any).siteConfig?.findFirst ? await prisma.siteConfig.findFirst() : null;
    } catch (err) {
      console.error("SiteConfig fetch failed", err);
    }

    try {
      await sendContactLeadEmailToAdmin(
        payload,
        siteConfig ? { siteName: (siteConfig as any).heroTitle ?? "AnamSoft", email: siteConfig.email } : undefined
      );
    } catch (err) {
      console.error("Contact admin email failed", err);
    }

    // non-blocking confirmation
    sendContactLeadConfirmationEmail(payload).catch((err) => console.error("Contact confirmation error", err));

    return NextResponse.json({ ok: true, data: { id: leadId } }, { status: 201 });
  } catch (error) {
    console.error("Contact submission error", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
