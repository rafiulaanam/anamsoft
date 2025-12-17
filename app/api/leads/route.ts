import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { LeadPriority, LeadStatus } from "@prisma/client";
import { sendLeadConfirmationEmail, sendLeadNotificationEmail } from "@/lib/email";
import { z } from "zod";

const intakeSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z
    .string()
    .url("Website must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : undefined)),
  message: z.string().min(10, "Message must be at least 10 characters"),
  source: z.string().optional(),
  serviceInterest: z.string().optional(),
  honeypot: z.string().optional(),
});

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 5;
const shouldRateLimit = process.env.NODE_ENV === "production";
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string | null) {
  if (!shouldRateLimit) return false;
  if (!ip) return false;
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return false;
}

function computeSpamScore(message: string) {
  const keywords = ["http://", "https://", "free", "winner", "prize", "money", "credit", "loan"];
  let score = 0;
  const lower = message.toLowerCase();
  keywords.forEach((kw) => {
    if (lower.includes(kw)) score += 2;
  });
  const links = (message.match(/https?:\/\//gi) || []).length;
  score += links * 2;
  if (message.length < 20) score += 2;
  if (message.length > 500) score += 1;
  return score;
}

function derivePriority(spamScore: number, message: string): LeadPriority {
  if (spamScore >= 5) return "LOW";
  if (message.length > 180 && spamScore <= 2) return "HIGH";
  if (message.toLowerCase().includes("urgent") && spamScore <= 3) return "HIGH";
  return "MEDIUM";
}

function computeLeadScore(payload: { message: string }) {
  const spamScore = computeSpamScore(payload.message);
  const leadScore = Math.max(0, 100 - spamScore * 10);
  const reasons: string[] = [];

  if (payload.message.length > 250) {
    reasons.push("Detailed message suggests strong interest");
  } else if (payload.message.length < 50) {
    reasons.push("Short message may need follow-up");
  } else {
    reasons.push("Message length within expected range");
  }

  if (spamScore >= 5) {
    reasons.push("Spam indicators detected");
  } else {
    reasons.push("No spam indicators detected");
  }

  return { leadScore, spamScore, reasons };
}

const allowedStatuses: LeadStatus[] = [
  "NEW",
  "OPEN",
  "IN_PROGRESS",
  "ATTEMPTED_TO_CONTACT",
  "CONNECTED",
  "APPOINTMENT_SCHEDULED",
  "QUALIFIED_TO_BUY",
  "CONTRACT_SENT",
  "OPEN_DEAL",
  "CLOSED_WON",
  "CLOSED_LOST",
  "UNQUALIFIED",
  "BAD_TIMING",
  "NOT_A_FIT",
];

const allowedPriorities: LeadPriority[] = ["LOW", "MEDIUM", "HIGH"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const unreadParam = searchParams.get("unread");
    const priority = searchParams.get("priority");
    const source = searchParams.get("source");
    const followUp = searchParams.get("followUp");

    const where: Record<string, any> = {};
    if (status && status !== "ALL" && allowedStatuses.includes(status as LeadStatus)) {
      where.leadStatus = status;
    }
    if (priority && allowedPriorities.includes(priority as LeadPriority)) {
      where.priority = priority;
    }
    if (source && source !== "ALL" && source.trim()) {
      where.source = source.trim();
    }
    if (unreadParam === "true") where.unread = true;
    if (unreadParam === "false") where.unread = false;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const now = new Date();
    if (followUp === "overdue") {
      where.nextFollowUpAt = { lt: now };
    } else if (followUp === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.nextFollowUpAt = { gte: start, lt: end };
    } else if (followUp === "week") {
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      where.nextFollowUpAt = { gte: now, lte: end };
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ unread: "desc" }, { createdAt: "desc" }],
    });
    const mapped = leads.map((lead) => ({
        id: lead.id,
        fullName: lead.fullName ?? "—",
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        message: lead.message,
        leadStatus: lead.leadStatus,
        unread: lead.unread,
        notes: lead.notes,
        leadScore: lead.leadScore,
        score: lead.score,
        priority: lead.priority,
        aiSummary: null,
        source: lead.source,
        owner: lead.assignedTo,
        activities: lead.activities.map((activity) => ({
          id: activity.id,
          type: activity.type,
          message: activity.message,
          metadata: activity.metadata ?? null,
          createdAt: activity.createdAt.toISOString(),
        })),
        lastActivityAt: lead.activities?.[0]?.createdAt?.toISOString?.() ?? null,
        value: null,
        budgetRange: lead.budgetRange,
        serviceInterest: lead.serviceInterest,
        targetDeadline: lead.targetDeadline?.toISOString(),
        meetingAt: lead.meetingAt?.toISOString(),
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
        nextFollowUpAt: lead.nextFollowUpAt?.toISOString(),
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt?.toISOString?.(),
        repliedAt: null,
      }));
    return NextResponse.json({ data: mapped }, { status: 200 });
  } catch (error) {
    console.error("Error fetching leads", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.ip ?? null;
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many submissions. Please try again shortly." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = intakeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid submission", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    if (data.honeypot && data.honeypot.trim() !== "") {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    const { leadScore, spamScore, reasons } = computeLeadScore({ message: data.message });
    const priority = derivePriority(spamScore, data.message);
    const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

    const existing = await prisma.lead.findFirst({
      where: {
        email: data.email,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          message: data.message,
          company: data.company ?? existing.company,
          phone: data.phone ?? existing.phone,
          website: data.website ?? existing.website,
          serviceInterest: data.serviceInterest ?? existing.serviceInterest,
          source: data.source ?? existing.source,
          unread: true,
          spamScore,
          leadScore,
          score: leadScore,
        },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: existing.id,
          type: "NEW_MESSAGE",
          message: "New message received",
          metadata: {
            deduped: true,
            source: data.source ?? "website_form",
            leadScoreReasons: reasons,
          },
        },
      });

      return NextResponse.json({ ok: true, deduped: true, leadId: existing.id }, { status: 200 });
    }

    const lead = await prisma.lead.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        company: data.company ?? null,
        website: data.website ?? null,
        message: data.message,
        source: data.source ?? "website_form",
        serviceInterest: data.serviceInterest ?? null,
        priority,
        leadStatus: "NEW",
        unread: true,
        spamScore,
        leadScore,
        score: leadScore,
        activities: {
          create: [
            { type: "CREATED", message: "Lead created from website form" },
            {
              type: "AUTO_TAGGED",
              message: `Priority set to ${priority}`,
              metadata: { leadScoreReasons: reasons },
            },
          ],
        },
      },
    });

    try {
      await sendLeadNotificationEmail({
        name: lead.fullName,
        salonName: lead.company ?? "",
        email: lead.email ?? "",
        website: lead.website ?? undefined,
        message: lead.message,
        createdAt: lead.createdAt,
      });
      await sendLeadConfirmationEmail({
        name: lead.fullName,
        salonName: lead.company ?? "",
        email: lead.email ?? "",
      });
    } catch (err) {
      console.error("Error sending lead emails", err);
    }

    return NextResponse.json({ ok: true, deduped: false, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
