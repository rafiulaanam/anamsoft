"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { RequirementSchema, type ActionResult } from "@/lib/validators/project";
import { z } from "zod";

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

export async function addRequirement(projectId: string, data: FormData): Promise<ActionResult> {
  const trashedCheck = await ensureProjectActive(projectId);
  if (trashedCheck) return trashedCheck;

  const parsed = RequirementSchema.safeParse({
    group: (data.get("group") as string) ?? "",
    label: (data.get("label") as string) ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the errors.", fieldErrors: mapFieldErrors(parsed.error) };
  }
  try {
    await prisma.projectRequirement.create({
      data: {
        ...parsed.data,
        projectId,
      },
    });
    revalidate(projectId);
    return { ok: true, message: "Requirement added" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to add requirement" };
  }
}

export async function toggleRequirementDone(requirementId: string): Promise<ActionResult> {
  const idSchema = z.string().min(1, "Requirement ID is required");
  const parsedId = idSchema.safeParse(requirementId);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid requirement", nonce: Date.now().toString() };
  }
  try {
    const req = await prisma.projectRequirement.findUnique({
      where: { id: requirementId },
      include: { project: { select: { deletedAt: true } } },
    });
    if (!req) return { ok: false, message: "Requirement not found" };
    if (req.project.deletedAt) return { ok: false, message: "This project is in Trash. Restore it to edit." };
    const updated = await prisma.projectRequirement.update({
      where: { id: requirementId },
      data: { isDone: !req.isDone },
    });
    revalidate(req.projectId);
    return { ok: true, message: "Requirement updated", nonce: Date.now().toString(), data: { isDone: updated.isDone } as any };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to update requirement" };
  }
}

export async function deleteRequirement(requirementId: string): Promise<ActionResult> {
  try {
    const req = await prisma.projectRequirement.findUnique({
      where: { id: requirementId },
      select: { projectId: true, project: { select: { deletedAt: true } } },
    });
    if (!req) return { ok: false, message: "Requirement not found" };
    if (req.project.deletedAt) return { ok: false, message: "This project is in Trash. Restore it to edit." };

    await prisma.projectRequirement.delete({ where: { id: requirementId } });
    revalidate(req.projectId);
    return { ok: true, message: "Requirement deleted" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to delete requirement" };
  }
}

export async function reorderRequirements(
  projectId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    const trashedCheck = await ensureProjectActive(projectId);
    if (trashedCheck) return trashedCheck;

    const updates = orderedIds.map((id, idx) =>
      prisma.projectRequirement.update({ where: { id }, data: { sortOrder: idx } })
    );
    await prisma.$transaction(updates);
    revalidate(projectId);
    return { ok: true, message: "Requirements reordered" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to reorder requirements" };
  }
}

export async function bulkToggleGroupDone(projectId: string, group: string): Promise<ActionResult> {
  try {
    const reqs = await prisma.projectRequirement.findMany({ where: { projectId, group } });
    const allDone = reqs.every((r) => r.isDone);
    await prisma.projectRequirement.updateMany({
      where: { projectId, group },
      data: { isDone: !allDone },
    });
    revalidate(projectId);
    return { ok: true, message: "Group updated" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to update group" };
  }
}
