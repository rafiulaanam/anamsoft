import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendProjectEstimateAdminNotification,
  sendProjectEstimateClientConfirmation,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    if (!(prisma as any)?.projectEstimate) {
      throw new Error("ProjectEstimate model is not available. Did you restart after running prisma generate?");
    }

    const body = await req.json();
    const {
      name,
      email,
      salonName,
      websiteUrl,
      businessType,
      pagesNeeded,
      bookingSetup,
      budgetRange,
      timeline,
      goals,
    } = body;

    if (!name || !email || !businessType || !budgetRange || !timeline) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const pagesJoined =
      Array.isArray(pagesNeeded) && pagesNeeded.length > 0 ? pagesNeeded.join(", ") : "";

    const estimate = await prisma.projectEstimate.create({
      data: {
        name,
        email,
        salonName: salonName || null,
        websiteUrl: websiteUrl || null,
        businessType,
        pagesNeeded: pagesJoined,
        bookingSetup: bookingSetup || "",
        budgetRange,
        timeline,
        goals: goals || null,
      },
    });

    const siteConfig = await prisma.siteConfig.findFirst();

    if (siteConfig?.sendAdminLeadEmails) {
      void sendProjectEstimateAdminNotification(
        {
          id: estimate.id,
          name: estimate.name,
          email: estimate.email,
          salonName: estimate.salonName ?? undefined,
          websiteUrl: estimate.websiteUrl ?? undefined,
          businessType: estimate.businessType,
          pagesNeeded: estimate.pagesNeeded,
          bookingSetup: estimate.bookingSetup,
          budgetRange: estimate.budgetRange,
          timeline: estimate.timeline,
          goals: estimate.goals ?? undefined,
        },
        { siteName: siteConfig.heroTitle, email: siteConfig.email }
      );
    }

    if (siteConfig?.sendClientLeadEmails) {
      void sendProjectEstimateClientConfirmation(
        {
          id: estimate.id,
          name: estimate.name,
          email: estimate.email,
          salonName: estimate.salonName ?? undefined,
          websiteUrl: estimate.websiteUrl ?? undefined,
          businessType: estimate.businessType,
          pagesNeeded: estimate.pagesNeeded,
          bookingSetup: estimate.bookingSetup,
          budgetRange: estimate.budgetRange,
          timeline: estimate.timeline,
          goals: estimate.goals ?? undefined,
        },
        { siteName: siteConfig.heroTitle, email: siteConfig.email }
      );
    }

    return NextResponse.json({ data: estimate }, { status: 201 });
  } catch (error) {
    console.error("Error creating project estimate", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const estimates = await prisma.projectEstimate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: estimates });
  } catch (error) {
    console.error("Error fetching project estimates", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch estimates" },
      { status: 500 }
    );
  }
}
