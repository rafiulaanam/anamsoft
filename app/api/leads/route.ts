import type { LeadRow } from "@/types/lead";
import { LeadSubmissionSchema } from "@/lib/validators/lead";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sendLeadNotificationEmail, sendLeadConfirmationEmail } from "@/lib/email";

const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(_req: NextRequest) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        activities: { orderBy: { createdAt: "desc" } },
      },
    });

    const mapped: LeadRow[] = leads.map((lead) => ({
      id: lead.id,
      fullName: lead.fullName ?? "",
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      website: lead.website,
      message: lead.message,
      source: lead.source,
      serviceInterest: lead.serviceInterest,
      timeline: lead.timeline,
      budgetRange: lead.budgetRange,
      owner: lead.assignedTo ?? null,
      leadStatus: lead.leadStatus,
      priority: lead.priority,
      unread: lead.unread,
      notes: lead.notes,
      attachments: lead.attachments,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt?.toISOString() ?? null,
      lastActivityAt: lead.lastContactedAt?.toISOString() ?? null,
      nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
      targetDeadline: lead.targetDeadline?.toISOString() ?? null,
      meetingAt: lead.meetingAt?.toISOString() ?? null,
      meetingType: lead.meetingType,
      meetingLink: lead.meetingLink,
      decisionMaker: lead.decisionMaker,
      qualificationNotes: lead.qualificationNotes,
      decisionCriteriaNotes: lead.decisionCriteriaNotes,
      decisionProcessNotes: lead.decisionProcessNotes,
      paperProcessNotes: lead.paperProcessNotes,
      competitionNotes: lead.competitionNotes,
      mustHaveFeatures: lead.mustHaveFeatures,
      referenceSites: lead.referenceSites,
      leadScore: lead.leadScore ?? null,
      score: lead.score ?? null,
      value: null,
      aiSummary: null,
      repliedAt: null,
      activities: lead.activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        metadata: activity.metadata,
        createdAt: activity.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error("Failed to load leads", error);
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = LeadSubmissionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: {
            fieldErrors: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    if (parsed.data.honeypot?.trim()) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    const clientKey = getClientKey(req);
    const now = Date.now();
    const bucket = rateLimitStore.get(clientKey);
    if (!bucket || bucket.resetAt <= now) {
      rateLimitStore.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    } else {
      if (bucket.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Too many submissions. Please try again later." },
          { status: 429 }
        );
      }
      bucket.count += 1;
    }

    const trimmed = {
      fullName: parsed.data.fullName.trim(),
      email: parsed.data.email.trim(),
      phone: parsed.data.phone?.trim() || null,
      website: parsed.data.website?.trim() || null,
      company: parsed.data.company?.trim() || null,
      serviceInterest: parsed.data.serviceInterest?.trim() || null,
      budgetRange: parsed.data.budgetRange?.trim() || null,
      timeline: parsed.data.timeline?.trim() || null,
      message: parsed.data.message.trim(),
      attachments: parsed.data.attachments?.length ? parsed.data.attachments : null,
      source: parsed.data.source?.trim() || "website_form",
    };

    const lead = await prisma.lead.create({
      data: {
        fullName: trimmed.fullName,
        email: trimmed.email,
        phone: trimmed.phone,
        website: trimmed.website,
        company: trimmed.company,
        message: trimmed.message,
        serviceInterest: trimmed.serviceInterest,
        budgetRange: trimmed.budgetRange,
        timeline: trimmed.timeline,
        attachments: trimmed.attachments,
        source: trimmed.source,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");

    const notificationPayload = {
      name: trimmed.fullName,
      salonName: trimmed.company ?? "New lead",
      email: trimmed.email,
      website: trimmed.website ?? null,
      message: trimmed.message,
      createdAt: lead.createdAt,
    };

    const confirmationPayload = {
      name: trimmed.fullName,
      salonName: trimmed.company ?? "your project",
      email: trimmed.email,
    };

    await Promise.allSettled([
      sendLeadNotificationEmail(notificationPayload),
      sendLeadConfirmationEmail(confirmationPayload),
    ]);

    return NextResponse.json({ data: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error("Lead submission error", error);
    return NextResponse.json(
      { error: "Failed to submit lead. Please try again." },
      { status: 500 }
    );
  }
}
