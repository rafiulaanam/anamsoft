"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  formError?: string;
  nonce?: string;
  data?: { leadScore?: number; reasons?: string[] };
};

const meetingTypes = ["CALL", "VIDEO", "IN_PERSON"] as const;
const budgetRanges = [
  "UNKNOWN",
  "UNDER_500",
  "BETWEEN_500_AND_1000",
  "BETWEEN_1000_AND_3000",
  "BETWEEN_3000_AND_6000",
  "ABOVE_6000",
] as const;
const decisionMakers = ["UNKNOWN", "DECISION_MAKER", "INFLUENCER", "NEEDS_APPROVAL"] as const;

function isValidDateInput(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function mapErrors(error: z.ZodError<any>): ActionResult {
  const flat = error.flatten();
  const fieldErrors: Record<string, string> = {};
  Object.entries(flat.fieldErrors || {}).forEach(([k, v]) => {
    if (v?.length) fieldErrors[k] = v[0];
  });
  return {
    ok: false,
    message: flat.formErrors?.[0] || Object.values(fieldErrors)[0] || "Please fix the errors.",
    formError: flat.formErrors?.[0],
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    nonce: Date.now().toString(),
  };
}

async function ensureLead(leadId: string) {
  return prisma.lead.findUnique({ where: { id: leadId } });
}

function revalidate(leadId: string) {
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

const idSchema = z.object({ leadId: z.string().min(1, "Lead ID is required") });

export async function markContacted(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = idSchema.safeParse({ leadId: formData.get("leadId") });
  if (!parsed.success) return mapErrors(parsed.error);
  const { leadId } = parsed.data;

  const lead = await ensureLead(leadId);
  if (!lead) return { ok: false, message: "Lead not found", nonce: Date.now().toString() };

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        leadStatus: "IN_PROGRESS",
        lastContactedAt: new Date(),
        activities: { create: { type: "STATUS_CHANGED", message: "Marked contacted" } },
      },
    });
    revalidate(leadId);
    return { ok: true, message: "Lead marked as contacted", nonce: Date.now().toString() };
  } catch (error) {
    console.error("markContacted error", error);
    return { ok: false, message: "Failed to mark contacted", nonce: Date.now().toString() };
  }
}

const scheduleSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  meetingAt: z
    .string()
    .min(1, "Meeting date is required")
    .refine((val) => isValidDateInput(val), { message: "Meeting date is invalid" }),
  meetingType: z.enum(meetingTypes, { errorMap: () => ({ message: "Choose a meeting type" }) }),
  meetingLink: z.string().url("Meeting link must be a valid URL").optional().or(z.literal("")),
});

export async function scheduleAppointment(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = scheduleSchema.safeParse({
    leadId: formData.get("leadId"),
    meetingAt: formData.get("meetingAt"),
    meetingType: formData.get("meetingType"),
    meetingLink: formData.get("meetingLink") || undefined,
  });
  if (!parsed.success) return mapErrors(parsed.error);

  const { leadId, meetingAt, meetingType, meetingLink } = parsed.data;
  const meetingDate = new Date(meetingAt);
  const lead = await ensureLead(leadId);
  if (!lead) return { ok: false, message: "Lead not found", nonce: Date.now().toString(), formError: "Lead not found" };

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        leadStatus: "APPOINTMENT_SCHEDULED",
        meetingAt: meetingDate,
        meetingType,
        meetingLink: meetingLink || null,
        nextFollowUpAt: meetingDate,
        activities: {
          create: {
            type: "APPOINTMENT_SET",
            message: "Appointment scheduled",
            metadata: { meetingAt, meetingType, meetingLink },
          },
        },
      },
    });
    revalidate(leadId);
    return { ok: true, message: "Appointment scheduled", nonce: Date.now().toString() };
  } catch (error) {
    console.error("scheduleAppointment error", error);
    return { ok: false, message: "Failed to schedule", nonce: Date.now().toString() };
  }
}

const referenceSiteSchema = z.object({
  url: z.string().url("Reference URL must be valid"),
  note: z.string().max(200).optional(),
});

const qualificationSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  budgetRange: z.enum(budgetRanges),
  targetDeadline: z
    .string()
    .optional()
    .refine((val) => (val ? isValidDateInput(val) : true), { message: "Target deadline is invalid" }),
  mustHaveFeatures: z.array(z.string().min(1)).optional(),
  referenceSites: z.array(referenceSiteSchema).optional(),
  decisionMaker: z.enum(decisionMakers),
  meetingAt: z
    .string()
    .optional()
    .refine((val) => (val ? isValidDateInput(val) : true), { message: "Meeting date is invalid" }),
  meetingType: z.enum(meetingTypes).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  bantBudgetConfirmed: z.boolean().optional(),
  bantAuthorityConfirmed: z.boolean().optional(),
  bantNeedConfirmed: z.boolean().optional(),
  bantTimelineConfirmed: z.boolean().optional(),
  qualificationNotes: z.string().max(4000).optional(),
  decisionCriteriaNotes: z.string().max(2000).optional(),
  decisionProcessNotes: z.string().max(2000).optional(),
  paperProcessNotes: z.string().max(2000).optional(),
  competitionNotes: z.string().max(2000).optional(),
  championIdentified: z.boolean().optional(),
  nextFollowUpAt: z
    .string()
    .optional()
    .refine((val) => (val ? isValidDateInput(val) : true), { message: "Next follow-up date is invalid" }),
  lastContactedAt: z
    .string()
    .optional()
    .refine((val) => (val ? isValidDateInput(val) : true), { message: "Last contacted date is invalid" }),
  markRead: z.boolean().optional(),
});

export async function saveQualification(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = qualificationSchema.safeParse({
    leadId: formData.get("leadId"),
    budgetRange: formData.get("budgetRange"),
    targetDeadline: formData.get("targetDeadline") || undefined,
    mustHaveFeatures: parseJsonArray(formData.get("mustHaveFeatures")),
    referenceSites: parseJsonArray(formData.get("referenceSites")),
    decisionMaker: formData.get("decisionMaker"),
    meetingAt: formData.get("meetingAt") || undefined,
    meetingType: formData.get("meetingType") || undefined,
    meetingLink: formData.get("meetingLink") || undefined,
    bantBudgetConfirmed: formData.get("bantBudgetConfirmed") === "true",
    bantAuthorityConfirmed: formData.get("bantAuthorityConfirmed") === "true",
    bantNeedConfirmed: formData.get("bantNeedConfirmed") === "true",
    bantTimelineConfirmed: formData.get("bantTimelineConfirmed") === "true",
    qualificationNotes: formData.get("qualificationNotes") || undefined,
    decisionCriteriaNotes: formData.get("decisionCriteriaNotes") || undefined,
    decisionProcessNotes: formData.get("decisionProcessNotes") || undefined,
    paperProcessNotes: formData.get("paperProcessNotes") || undefined,
    competitionNotes: formData.get("competitionNotes") || undefined,
    championIdentified: formData.get("championIdentified") === "true",
    nextFollowUpAt: formData.get("nextFollowUpAt") || undefined,
    lastContactedAt: formData.get("lastContactedAt") || undefined,
    markRead: formData.get("markRead") === "true",
  });
  if (!parsed.success) return mapErrors(parsed.error);

  const {
    leadId,
    budgetRange,
    targetDeadline,
    mustHaveFeatures,
    referenceSites,
    decisionMaker,
    meetingAt,
    meetingType,
    meetingLink,
    bantBudgetConfirmed,
    bantAuthorityConfirmed,
    bantNeedConfirmed,
    bantTimelineConfirmed,
    qualificationNotes,
    decisionCriteriaNotes,
    decisionProcessNotes,
    paperProcessNotes,
    competitionNotes,
    championIdentified,
    nextFollowUpAt,
    lastContactedAt,
    markRead,
  } = parsed.data;

  const { score, reasons } = computeQualificationScore({
    bantBudgetConfirmed,
    bantAuthorityConfirmed,
    bantNeedConfirmed,
    bantTimelineConfirmed,
    decisionCriteriaNotes,
    decisionProcessNotes,
    paperProcessNotes,
    championIdentified,
    meetingScheduled: Boolean(meetingAt),
    hasFeatures: !!mustHaveFeatures?.length,
  });
  const lead = await ensureLead(leadId);
  if (!lead) return { ok: false, message: "Lead not found", formError: "Lead not found", nonce: Date.now().toString() };

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        budgetRange,
        targetDeadline: targetDeadline ? new Date(targetDeadline) : null,
        mustHaveFeatures: mustHaveFeatures ?? null,
        referenceSites: referenceSites ?? null,
        decisionMaker,
        meetingAt: meetingAt ? new Date(meetingAt) : null,
        meetingType: meetingType ?? null,
        meetingLink: meetingLink || null,
        bantBudgetConfirmed: !!bantBudgetConfirmed,
        bantAuthorityConfirmed: !!bantAuthorityConfirmed,
        bantNeedConfirmed: !!bantNeedConfirmed,
        bantTimelineConfirmed: !!bantTimelineConfirmed,
        qualificationNotes: qualificationNotes ?? null,
        decisionCriteriaNotes: decisionCriteriaNotes ?? null,
        decisionProcessNotes: decisionProcessNotes ?? null,
        paperProcessNotes: paperProcessNotes ?? null,
        competitionNotes: competitionNotes ?? null,
        championIdentified: !!championIdentified,
        leadScore: score,
        score,
        nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
        lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : null,
        unread: markRead ? false : undefined,
        activities: { create: { type: "NOTE_ADDED", message: "Qualification updated" } },
      },
    });
    revalidate(leadId);
    return { ok: true, message: "Qualification saved", nonce: Date.now().toString(), data: { leadScore: score, reasons } };
  } catch (error) {
    console.error("saveQualification error", error);
    return { ok: false, message: "Failed to save qualification", nonce: Date.now().toString() };
  }
}

function meetsBant(lead: any) {
  return Boolean(
    lead.bantNeedConfirmed &&
      lead.bantTimelineConfirmed &&
      (lead.bantBudgetConfirmed || lead.bantAuthorityConfirmed),
  );
}

function computeQualificationScore(input: {
  bantBudgetConfirmed?: boolean;
  bantAuthorityConfirmed?: boolean;
  bantNeedConfirmed?: boolean;
  bantTimelineConfirmed?: boolean;
  decisionCriteriaNotes?: string | null;
  decisionProcessNotes?: string | null;
  paperProcessNotes?: string | null;
  championIdentified?: boolean;
  meetingScheduled?: boolean;
  hasFeatures?: boolean;
}) {
  let score = 0;
  const reasons: string[] = [];

  if (input.bantNeedConfirmed) {
    score += 25;
    reasons.push("Need confirmed (+25)");
  }
  if (input.bantTimelineConfirmed) {
    score += 20;
    reasons.push("Timeline confirmed (+20)");
  }
  if (input.bantBudgetConfirmed) {
    score += 20;
    reasons.push("Budget confirmed (+20)");
  }
  if (input.bantAuthorityConfirmed) {
    score += 15;
    reasons.push("Authority confirmed (+15)");
  }
  if (input.meetingScheduled) {
    score += 10;
    reasons.push("Meeting scheduled (+10)");
  }
  if (input.hasFeatures) {
    score += 10;
    reasons.push("Must-have features captured (+10)");
  }
  const decisionNotes = [input.decisionCriteriaNotes, input.decisionProcessNotes, input.paperProcessNotes]
    .filter((v) => (v ?? "").trim().length > 0).length;
  if (decisionNotes > 0) {
    const bonus = Math.min(15, decisionNotes * 5);
    score += bonus;
    reasons.push(`Decision clarity (${decisionNotes} notes) (+${bonus})`);
  }
  if (input.championIdentified) {
    score += 5;
    reasons.push("Champion identified (+5)");
  }

  return { score: Math.min(100, score), reasons };
}

export async function markQualifiedToBuy(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = idSchema.safeParse({ leadId: formData.get("leadId") });
  if (!parsed.success) return mapErrors(parsed.error);
  const { leadId } = parsed.data;

  const lead = await ensureLead(leadId);
  if (!lead) return { ok: false, message: "Lead not found", nonce: Date.now().toString() };

  if (!meetsBant(lead)) {
    return {
      ok: false,
      fieldErrors: { bantNeedConfirmed: "To qualify: confirm Need + Timeline and Budget or Authority." },
      message: "To qualify: confirm Need + Timeline and Budget or Authority.",
      nonce: Date.now().toString(),
    };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        leadStatus: "QUALIFIED_TO_BUY",
        activities: { create: { type: "QUALIFIED", message: "Marked qualified to buy" } },
      },
    });
    revalidate(leadId);
    return { ok: true, message: "Lead marked as qualified", nonce: Date.now().toString() };
  } catch (error) {
    console.error("markQualifiedToBuy error", error);
    return { ok: false, message: "Failed to update lead", nonce: Date.now().toString() };
  }
}

const notFitSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  reason: z.string().min(1, "Reason is required"),
  note: z.string().max(1000).optional(),
});

export async function markNotAFit(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = notFitSchema.safeParse({
    leadId: formData.get("leadId"),
    reason: formData.get("reason"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) return mapErrors(parsed.error);
  const { leadId, reason, note } = parsed.data;
  const lead = await ensureLead(leadId);
  if (!lead) return { ok: false, message: "Lead not found", nonce: Date.now().toString(), formError: "Lead not found" };

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        leadStatus: "NOT_A_FIT",
        disqualifyReason: reason,
        disqualifyNote: note ?? null,
        activities: { create: { type: "DISQUALIFIED", message: `Not a fit: ${reason}` } },
      },
    });
    revalidate(leadId);
    return { ok: true, message: "Lead marked as not a fit", nonce: Date.now().toString() };
  } catch (error) {
    console.error("markNotAFit error", error);
    return { ok: false, message: "Failed to disqualify lead", nonce: Date.now().toString() };
  }
}

const followUpSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  nextFollowUpAt: z
    .string()
    .min(1, "Follow-up date is required")
    .refine((val) => isValidDateInput(val), { message: "Follow-up date is invalid" }),
});

export async function setNextFollowUp(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = followUpSchema.safeParse({
    leadId: formData.get("leadId"),
    nextFollowUpAt: formData.get("nextFollowUpAt"),
  });
  if (!parsed.success) return mapErrors(parsed.error);

  const { leadId, nextFollowUpAt } = parsed.data;
  const nextDate = new Date(nextFollowUpAt);
  const lead = await ensureLead(leadId);
  if (!lead) return { ok: false, message: "Lead not found", nonce: Date.now().toString(), formError: "Lead not found" };

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        nextFollowUpAt: nextDate,
        activities: { create: { type: "FOLLOWUP_SET", message: "Follow-up scheduled", metadata: { nextFollowUpAt } } },
      },
    });
    revalidate(leadId);
    return { ok: true, message: "Follow-up scheduled", nonce: Date.now().toString() };
  } catch (error) {
    console.error("setNextFollowUp error", error);
    return { ok: false, message: "Failed to set follow-up", nonce: Date.now().toString() };
  }
}

function parseJsonArray(raw: FormDataEntryValue | null): any[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
