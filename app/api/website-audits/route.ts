import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendWebsiteAuditAdminNotification,
  sendWebsiteAuditClientConfirmation,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    if (!(prisma as any)?.websiteAudit) {
      throw new Error("WebsiteAudit model is not available. Did you restart after running prisma generate?");
    }

    const body = await req.json();
    const { name, email, websiteUrl, businessType, mainGoal, message } = body;

    if (!name || !email || !websiteUrl || !mainGoal) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const audit = await prisma.websiteAudit.create({
      data: {
        name,
        email,
        websiteUrl,
        businessType: businessType || null,
        mainGoal,
        message: message || null,
      },
    });

    const siteConfig = await prisma.siteConfig.findFirst();

    if (siteConfig?.sendAdminLeadEmails) {
      void sendWebsiteAuditAdminNotification(
        {
          id: audit.id,
          name: audit.name,
          email: audit.email,
          websiteUrl: audit.websiteUrl,
          businessType: audit.businessType ?? undefined,
          mainGoal: audit.mainGoal,
          message: audit.message ?? undefined,
        },
        { siteName: siteConfig.heroTitle, email: siteConfig.email }
      );
    }

    if (siteConfig?.sendClientLeadEmails) {
      void sendWebsiteAuditClientConfirmation(
        {
          id: audit.id,
          name: audit.name,
          email: audit.email,
          websiteUrl: audit.websiteUrl,
          businessType: audit.businessType ?? undefined,
          mainGoal: audit.mainGoal,
          message: audit.message ?? undefined,
        },
        { siteName: siteConfig.heroTitle, email: siteConfig.email }
      );
    }

    return NextResponse.json({ data: audit }, { status: 201 });
  } catch (error) {
    console.error("Error creating website audit", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const audits = await prisma.websiteAudit.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: audits });
  } catch (error) {
    console.error("Error fetching website audits", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch audits" },
      { status: 500 }
    );
  }
}
