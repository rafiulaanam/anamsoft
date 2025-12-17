"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MilestoneSchema, type ActionResult } from "@/lib/validators/project";

function mapFieldErrors(error: any) {
  if (!error?.flatten) return undefined;
  const flat = error.flatten();
  const fieldErrors: Record<string, string> = {};
  Object.entries(flat.fieldErrors || {}).forEach(([key, messages]) => {
    if (messages && messages.length > 0) {
      fieldErrors[key] = messages[0];
    }
  });
  return fieldErrors;
}

function revalidate(projectId: string) {
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
}

async function ensureProjectActive(projectId: string): Promise<ActionResult | null> {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { deletedAt: true } });
  if (!project) return { ok: false, message: "Project not found", nonce: Date.now().toString() };
  if (project.deletedAt) return { ok: false, message: "This project is in Trash. Restore it to edit.", nonce: Date.now().toString() };
  return null;
}

export async function addMilestone(projectId: string, data: FormData): Promise<ActionResult> {
  const trashedCheck = await ensureProjectActive(projectId);
  if (trashedCheck) return trashedCheck;

  const parsed = MilestoneSchema.safeParse({
    title: (data.get("title") as string) ?? "",
    dueDate: (data.get("dueDate") as string) || undefined,
    status: (data.get("status") as string) || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the errors.", fieldErrors: mapFieldErrors(parsed.error) };
  }
  try {
    await prisma.projectMilestone.create({
      data: {
        projectId,
        title: parsed.data.title,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        status: parsed.data.status || "NOT_STARTED",
      },
    });
    revalidate(projectId);
    return { ok: true, message: "Milestone added" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to add milestone" };
  }
}

export async function updateMilestone(milestoneId: string, data: FormData): Promise<ActionResult> {
  const parsed = MilestoneSchema.partial().safeParse({
    title: (data.get("title") as string) || undefined,
    dueDate: (data.get("dueDate") as string) || undefined,
    status: (data.get("status") as string) || undefined,
    sortOrder: undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the errors.", fieldErrors: mapFieldErrors(parsed.error) };
  }
  try {
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      select: { projectId: true, project: { select: { deletedAt: true } } },
    });
    if (!milestone) return { ok: false, message: "Milestone not found" };
    if (milestone.project.deletedAt) return { ok: false, message: "This project is in Trash. Restore it to edit." };

    await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      },
    });
    revalidate(milestone.projectId);
    return { ok: true, message: "Milestone updated" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to update milestone" };
  }
}

export async function setMilestoneStatus(milestoneId: string, status: string): Promise<ActionResult> {
  try {
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      select: { projectId: true, project: { select: { deletedAt: true } } },
    });
    if (!milestone) return { ok: false, message: "Milestone not found" };
    if (milestone.project.deletedAt) return { ok: false, message: "This project is in Trash. Restore it to edit." };

    await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { status } as any,
    });
    revalidate(milestone.projectId);
    return { ok: true, message: "Status updated" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to update status" };
  }
}

export async function deleteMilestone(milestoneId: string): Promise<ActionResult> {
  try {
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      select: { projectId: true, project: { select: { deletedAt: true } } },
    });
    if (!milestone) return { ok: false, message: "Milestone not found" };
    if (milestone.project.deletedAt) return { ok: false, message: "This project is in Trash. Restore it to edit." };

    await prisma.projectMilestone.delete({ where: { id: milestoneId } });
    revalidate(milestone.projectId);
    return { ok: true, message: "Milestone deleted" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to delete milestone" };
  }
}

export async function reorderMilestones(projectId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const trashedCheck = await ensureProjectActive(projectId);
    if (trashedCheck) return trashedCheck;

    const tx = orderedIds.map((id, idx) =>
      prisma.projectMilestone.update({
        where: { id },
        data: { sortOrder: idx },
      })
    );
    await prisma.$transaction(tx);
    revalidate(projectId);
    return { ok: true, message: "Milestones reordered" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to reorder milestones" };
  }
}
