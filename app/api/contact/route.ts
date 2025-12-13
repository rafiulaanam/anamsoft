import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ContactLeadPayload,
  sendContactLeadConfirmationEmail,
  sendContactLeadEmailToAdmin,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      businessName,
      websiteUrl,
      budgetRange,
      reason,
      message,
      howHeard,
    } = body as {
      name?: string;
      email?: string;
      businessName?: string;
      websiteUrl?: string;
      budgetRange?: string;
      reason?: string;
      message?: string;
      howHeard?: string;
    };

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const payload: ContactLeadPayload = {
      name: name.trim(),
      email: email.trim(),
      businessName: businessName?.trim() || undefined,
      websiteUrl: websiteUrl?.trim() || undefined,
      budgetRange: budgetRange?.trim() || undefined,
      reason: reason?.trim() || undefined,
      howHeard: howHeard?.trim() || undefined,
      message: message?.trim() || undefined,
    };

    const data: any = {
      name: payload.name,
      salonName: payload.businessName || "Contact",
      email: payload.email,
      website: payload.websiteUrl || null,
      message: payload.message || "",
      status: "NEW",
    };

    // Optional fields fallback: if schema lacks columns, append to notes for now
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

    let leadId: string | null = null;
    try {
      if ((prisma as any).lead?.create) {
        const lead = await prisma.lead.create({ data });
        leadId = lead?.id ?? null;
      }
    } catch (err) {
      console.error("Contact lead create failed", err);
      // continue to emails even if DB is unavailable
    }

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

    return NextResponse.json({ success: true, data: { id: leadId } });
  } catch (error) {
    console.error("Contact submission error", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
