import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ProjectEstimatePayload,
  sendProjectEstimateConfirmationEmail,
  sendProjectEstimateToAdmin,
} from "@/lib/email";

function calculateEstimate(pages: string[], features: string[], urgency?: string) {
  const base = 10;
  const score = base + pages.length * 2 + features.length * 3 + (urgency === "ASAP" ? 5 : 0);
  // Simple pricing heuristic (easy to tweak)
  const estimatedMin = Math.round(score * 30);
  const estimatedMax = Math.round(score * 55);
  return { complexityScore: score, estimatedMin, estimatedMax };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      businessName,
      currentSite,
      businessType,
      pages,
      features,
      budgetRange,
      urgency,
      notes,
    } = body as {
      name?: string;
      email?: string;
      businessName?: string;
      currentSite?: string;
      businessType?: string;
      pages?: string[];
      features?: string[];
      budgetRange?: string;
      urgency?: string;
      notes?: string;
    };

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const selectedPages = Array.isArray(pages) ? pages.filter(Boolean) : [];
    const selectedFeatures = Array.isArray(features) ? features.filter(Boolean) : [];

    if (selectedPages.length === 0 && selectedFeatures.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one page or feature." },
        { status: 400 }
      );
    }

    const { complexityScore, estimatedMin, estimatedMax } = calculateEstimate(
      selectedPages,
      selectedFeatures,
      urgency
    );

    // Map to existing ProjectEstimate fields in schema
    const estimate = await prisma.projectEstimate.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        salonName: businessName?.trim() || null,
        websiteUrl: currentSite?.trim() || null,
        businessType: businessType?.trim() || "Not specified",
        pagesNeeded: selectedPages.join(", "),
        bookingSetup: selectedFeatures.join(", "),
        budgetRange: budgetRange || "Not sure",
        timeline: urgency || "Not specified",
        goals: notes || null,
        notes:
          notes ||
          `Estimated range: €${estimatedMin}–€${estimatedMax} | Complexity: ${complexityScore}`,
        status: "NEW",
      },
    });

    const payload: ProjectEstimatePayload = {
      name: estimate.name,
      email: estimate.email,
      businessName: estimate.salonName || undefined,
      currentSite: estimate.websiteUrl || undefined,
      businessType: estimate.businessType,
      pages: selectedPages,
      features: selectedFeatures,
      budgetRange,
      urgency,
      notes,
      complexityScore,
      estimatedMin,
      estimatedMax,
    };

    await sendProjectEstimateToAdmin(payload);
    sendProjectEstimateConfirmationEmail(payload).catch((err) =>
      console.error("Estimate confirmation email error", err)
    );

    return NextResponse.json(
      {
        success: true,
        estimatedMin,
        estimatedMax,
        complexityScore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Estimate submission error", error);
    return NextResponse.json({ error: "Unable to submit estimate right now." }, { status: 500 });
  }
}
