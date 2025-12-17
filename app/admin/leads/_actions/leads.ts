"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { LeadPriority, LeadStatus, ProjectStatus } from "@prisma/client";
import { z } from "zod";
import { slugify } from "@/lib/slug";

export type LeadActionState<T = undefined> = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
  updatedAt?: number;
};

function mapFieldErrors(error: z.ZodError<any>) {
  const flat = error.flatten();
  const fieldErrors: Record<string, string> = {};
  Object.entries(flat.fieldErrors || {}).forEach(([key, messages]) => {
    if (messages?.length) fieldErrors[key] = messages[0];
  });
  const message = flat.formErrors?.[0] || Object.values(fieldErrors)[0];
  return { fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined, message };
}

function revalidate(leadId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

const updateSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  leadStatus: z.nativeEnum(LeadStatus).optional(),
  priority: z.nativeEnum(LeadPriority).optional(),
  assignedTo: z
    .string()
    .max(120, "Assign to must be 120 characters or less")
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  unread: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  nextFollowUpAt: z.string().optional(),
  notes: z.string().optional(),
});

const convertSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  projectName: z.string().min(2, "Project name must be at least 2 characters").optional(),
  scopeSummary: z.string().min(20, "Scope summary must be at least 20 characters").optional(),
});

const deleteSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
});

async function ensureLead(leadId: string) {
  return prisma.lead.findUnique({ where: { id: leadId } });
}

async function logActivities(
  leadId: string,
  items: { type: string; message: string; metadata?: Record<string, unknown> }[]
) {
  if (!items.length) return;
  await prisma.leadActivity.createMany({
    data: items.map((item) => ({
      leadId,
      type: item.type,
      message: item.message,
      metadata: item.metadata,
    })),
  });
}

export async function updateLead(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState<{ leadId: string }>> {
  const parsed = updateSchema.safeParse({
    leadId: formData.get("leadId"),
    leadStatus: formData.get("leadStatus") || undefined,
    priority: formData.get("priority") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    unread: formData.get("unread") || undefined,
    nextFollowUpAt: formData.get("nextFollowUpAt") || undefined,
    notes: formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    const { fieldErrors, message } = mapFieldErrors(parsed.error);
    return { ok: false, fieldErrors, message: message || "Fix the errors to continue.", updatedAt: Date.now() };
  }

  const { leadId, leadStatus, priority, assignedTo, unread, nextFollowUpAt, notes } = parsed.data;
  const existing = await ensureLead(leadId);
  if (!existing) return { ok: false, message: "Lead not found", updatedAt: Date.now() };

  const updates: Record<string, unknown> = {};
  const activities: { type: string; message: string; metadata?: Record<string, unknown> }[] = [];

  if (leadStatus && leadStatus !== existing.leadStatus) {
    updates.leadStatus = leadStatus;
    activities.push({ type: "STATUS_CHANGED", message: `Status changed to ${leadStatus}` });
  }

  if (priority && priority !== existing.priority) {
    updates.priority = priority;
    activities.push({ type: "PRIORITY_CHANGED", message: `Priority set to ${priority}` });
  }

  if (assignedTo !== undefined && assignedTo !== existing.assignedTo) {
    updates.assignedTo = assignedTo;
    activities.push({ type: "ASSIGNED", message: assignedTo ? `Assigned to ${assignedTo}` : "Assignment cleared" });
  }

  if (typeof unread === "boolean" && unread !== existing.unread) {
    updates.unread = unread;
    activities.push({ type: unread ? "MARKED_UNREAD" : "MARKED_READ", message: unread ? "Marked as unread" : "Marked as read" });
  }

  if (nextFollowUpAt !== undefined) {
    const trimmed = nextFollowUpAt?.trim();
    if (trimmed) {
      const date = new Date(trimmed);
      if (Number.isNaN(date.getTime())) {
        return { ok: false, message: "Follow-up date is invalid", fieldErrors: { nextFollowUpAt: "Invalid date" } };
      }
      if (!existing.nextFollowUpAt || existing.nextFollowUpAt.getTime() !== date.getTime()) {
        updates.nextFollowUpAt = date;
        activities.push({ type: "FOLLOW_UP_SET", message: `Follow-up scheduled for ${date.toISOString()}` });
      }
    } else if (existing.nextFollowUpAt) {
      updates.nextFollowUpAt = null;
      activities.push({ type: "FOLLOW_UP_CLEARED", message: "Follow-up cleared" });
    }
  }

  if (notes !== undefined && notes !== existing.notes) {
    updates.notes = notes;
    activities.push({ type: "NOTE_UPDATED", message: "Notes updated" });
  }

  if (!Object.keys(updates).length) {
    return { ok: true, message: "No changes to save", data: { leadId }, updatedAt: Date.now() };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...updates,
        activities: activities.length ? { create: activities.map((a) => ({ type: a.type, message: a.message, metadata: a.metadata })) } : undefined,
      },
    });
    revalidate(leadId);
    return { ok: true, message: "Lead updated", data: { leadId }, updatedAt: Date.now() };
  } catch (error) {
    console.error("Lead update error", error);
    return { ok: false, message: "Failed to update lead", updatedAt: Date.now() };
  }
}

export async function convertLeadToProject(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState<{ projectId: string }>> {
  const parsed = convertSchema.safeParse({
    leadId: formData.get("leadId"),
    projectName: formData.get("projectName") || undefined,
    scopeSummary: formData.get("scopeSummary") || undefined,
  });

  if (!parsed.success) {
    const { fieldErrors, message } = mapFieldErrors(parsed.error);
    return { ok: false, fieldErrors, message: message || "Fix the errors to continue.", updatedAt: Date.now() };
  }

  const { leadId, projectName, scopeSummary } = parsed.data;
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { ok: false, message: "Lead not found", updatedAt: Date.now() };

  const name = projectName || lead.company || `${lead.fullName} project`;
  const baseSlug = slugify(name || lead.fullName || "lead-project") || `lead-${leadId.slice(-6)}`;
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.project.findFirst({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const summary =
    scopeSummary ||
    (lead.message?.length && lead.message.length >= 20
      ? lead.message
      : `${lead.message ?? "Imported from lead"}\n\nAuto-generated from lead intake.`);

  try {
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        clientName: lead.fullName,
        clientEmail: lead.email,
        leadId: lead.id,
        status: ProjectStatus.PLANNING,
        scopeSummary: summary,
        techStack: [],
        activities: {
          create: [{ type: "CREATED", message: "Project created from lead" }],
        },
      },
    });

    await logActivities(lead.id, [{ type: "CONVERTED_TO_PROJECT", message: `Converted to project ${project.name}` }]);
    revalidate(lead.id);
    revalidatePath(`/admin/projects/${project.id}`);
    return {
      ok: true,
      message: "Lead converted to project",
      data: { projectId: project.id },
      updatedAt: Date.now(),
    };
  } catch (error) {
    console.error("Convert lead to project error", error);
    return { ok: false, message: "Failed to convert to project", updatedAt: Date.now() };
  }
}

export async function archiveLead(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState<{ leadId: string }>> {
  const parsed = deleteSchema.safeParse({ leadId: formData.get("leadId") });
  if (!parsed.success) {
    const { fieldErrors, message } = mapFieldErrors(parsed.error);
    return { ok: false, fieldErrors, message: message || "Invalid request", updatedAt: Date.now() };
  }

  const leadId = parsed.data.leadId;
  const existing = await ensureLead(leadId);
  if (!existing) return { ok: false, message: "Lead not found", updatedAt: Date.now() };

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        leadStatus: LeadStatus.UNQUALIFIED,
        unread: false,
        activities: { create: [{ type: "ARCHIVED", message: "Lead archived" }] },
      },
    });
    revalidate(leadId);
    return { ok: true, message: "Lead archived", data: { leadId }, updatedAt: Date.now() };
  } catch (error) {
    console.error("Archive lead error", error);
    return { ok: false, message: "Failed to archive lead", updatedAt: Date.now() };
  }
}

export async function deleteLead(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const parsed = deleteSchema.safeParse({ leadId: formData.get("leadId") });
  if (!parsed.success) {
    const { fieldErrors, message } = mapFieldErrors(parsed.error);
    return { ok: false, fieldErrors, message: message || "Invalid request", updatedAt: Date.now() };
  }

  const leadId = parsed.data.leadId;
  try {
    await prisma.lead.delete({ where: { id: leadId } });
    revalidate(leadId);
    return { ok: true, message: "Lead deleted", updatedAt: Date.now() };
  } catch (error) {
    console.error("Delete lead error", error);
    return { ok: false, message: "Failed to delete lead", updatedAt: Date.now() };
  }
}
