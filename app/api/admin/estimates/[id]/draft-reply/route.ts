import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AIProjectEstimateInput, generateEstimateReplyWithAI } from "@/lib/ai";

// Ensure this route is always dynamic and runs on the Node runtime to avoid prerender errors.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: NextRequest, context: { params: { id: string } }) {
  // During static build (or when Vercel is compiling), avoid DB/API work so Next can finish successfully.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return NextResponse.json({ subject: "Website estimate for your project", body: "" }, { status: 200 });
  }

  try {
    const { id } = context.params;

    let estimate;
    try {
      estimate = await prisma.projectEstimate.findUnique({
        where: { id },
      });
    } catch (err) {
      console.error("Prisma error in draft-reply route:", err);
      // Return a benign response so build/runtime doesn't fail if DB is unavailable.
      return NextResponse.json({ subject: "Website estimate for your project", body: "" }, { status: 200 });
    }

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    // If no API key is configured, return a harmless blank draft so UI still works.
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ subject: "Website estimate for your project", body: "" }, { status: 200 });
    }

    const aiInput: AIProjectEstimateInput = {
      name: estimate.name,
      email: estimate.email,
      businessName: (estimate as any).businessName ?? estimate.salonName ?? null,
      businessType: (estimate as any).businessType ?? null,
      currentSite: (estimate as any).currentSite ?? (estimate as any).websiteUrl ?? null,
      pages:
        (estimate as any).pages ??
        ((estimate as any).pagesNeeded
          ? String((estimate as any).pagesNeeded)
              .split(",")
              .map((p: string) => p.trim())
              .filter(Boolean)
          : []),
      features:
        (estimate as any).features ??
        ((estimate as any).bookingSetup
          ? String((estimate as any).bookingSetup)
              .split(",")
              .map((p: string) => p.trim())
              .filter(Boolean)
          : []),
      budgetRange: (estimate as any).budgetRange ?? null,
      urgency: (estimate as any).urgency ?? (estimate as any).timeline ?? null,
      notes: (estimate as any).notes ?? (estimate as any).goals ?? null,
    };

    const { subject, body } = await generateEstimateReplyWithAI(aiInput);

    return NextResponse.json({ subject, body }, { status: 200 });
  } catch (error) {
    console.error("Error drafting AI estimate reply:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
