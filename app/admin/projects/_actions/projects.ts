"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
  RequirementSchema,
  MilestoneSchema,
  FileLinkSchema,
  ProjectStatusValues,
  type ActionResult,
} from "@/lib/validators/project";

function mapFieldErrors(error: any) {
  if (!error?.flatten) return { fieldErrors: undefined, message: undefined };
  const flat = error.flatten();
  const fieldErrors: Record<string, string> = {};
  Object.entries(flat.fieldErrors || {}).forEach(([key, messages]) => {
    if (messages && messages.length > 0) {
      fieldErrors[key] = messages[0];
    }
  });
  const firstFieldMsg = Object.values(fieldErrors)[0];
  const message = flat.formErrors?.[0] || firstFieldMsg || "Please fix the errors.";
  return { fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined, message };
}

function revalidate(projectId?: string) {
  revalidatePath("/admin/projects");
  if (projectId) revalidatePath(`/admin/projects/${projectId}`);
}

async function getProjectForGuard(projectId: string) {
  return prisma.project.findUnique({ where: { id: projectId }, select: { deletedAt: true } });
}

const idSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  reason: z.string().max(200, "Reason must be 200 characters or less").optional(),
});

async function ensureNotTrashed(projectId: string): Promise<ActionResult | null> {
  const project = await getProjectForGuard(projectId);
  if (!project) return { ok: false, message: "Project not found", nonce: Date.now().toString() };
  if (project.deletedAt) return { ok: false, message: "This project is in Trash. Restore it to edit.", nonce: Date.now().toString() };
  return null;
}

function parseTechStack(formData: FormData) {
  const raw = (formData.get("techStack") as string) || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createProject(prevState: any, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = ProjectCreateSchema.safeParse({
    name: (formData.get("name") as string) ?? "",
    slug: (formData.get("slug") as string) ?? "",
    clientName: (formData.get("clientName") as string) || undefined,
    clientEmail: (formData.get("clientEmail") as string) || undefined,
    status: (formData.get("status") as string) || "PLANNING",
    startDate: (formData.get("startDate") as string) || undefined,
    deadline: (formData.get("deadline") as string) || undefined,
    techStack: parseTechStack(formData),
    repoUrl: (formData.get("repoUrl") as string) || undefined,
    stagingUrl: (formData.get("stagingUrl") as string) || undefined,
    productionUrl: (formData.get("productionUrl") as string) || undefined,
    scopeSummary: (formData.get("scopeSummary") as string) ?? "",
  });

  if (!parsed.success) {
    const { fieldErrors, message } = mapFieldErrors(parsed.error);
    return { ok: false, message: message || "Please fix the errors.", fieldErrors, updatedAt: Date.now() };
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        slug: parsed.data.slug || undefined,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      },
    });
    await prisma.projectActivity.create({
      data: { projectId: project.id, type: "CREATED", message: "Project created" },
    });
    revalidate(project.id);
    return { ok: true, data: { id: project.id }, message: "Project created", updatedAt: Date.now() };
  } catch (error: any) {
    console.error(error);
    if (error?.code === "P2002") {
      return { ok: false, message: "Slug must be unique", fieldErrors: { slug: "Slug must be unique" }, updatedAt: Date.now() };
    }
    return { ok: false, message: "Failed to create project", updatedAt: Date.now() };
  }
}

export async function updateProject(projectId: string, prevState: any, formData: FormData): Promise<ActionResult> {
  const trashedCheck = await ensureNotTrashed(projectId);
  if (trashedCheck) return trashedCheck;

  const parsed = ProjectUpdateSchema.safeParse({
    name: (formData.get("name") as string) || undefined,
    slug: (formData.get("slug") as string) || undefined,
    clientName: (formData.get("clientName") as string) || undefined,
    clientEmail: (formData.get("clientEmail") as string) || undefined,
    status: (formData.get("status") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    deadline: (formData.get("deadline") as string) || undefined,
    techStack: parseTechStack(formData),
    repoUrl: (formData.get("repoUrl") as string) || undefined,
    stagingUrl: (formData.get("stagingUrl") as string) || undefined,
    productionUrl: (formData.get("productionUrl") as string) || undefined,
    scopeSummary: (formData.get("scopeSummary") as string) || undefined,
    isArchived: undefined,
    sortOrder: undefined,
  });

  if (!parsed.success) {
    const { fieldErrors, message } = mapFieldErrors(parsed.error);
    return { ok: false, message: message || "Please fix the errors.", fieldErrors, updatedAt: Date.now() };
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
      },
    });
    await prisma.projectActivity.create({
      data: { projectId, type: "UPDATED", message: "Project updated" },
    });
    revalidate(projectId);
    return { ok: true, message: "Project updated", updatedAt: Date.now() };
  } catch (error: any) {
    console.error(error);
    if (error?.code === "P2002") {
      return { ok: false, message: "Slug must be unique", fieldErrors: { slug: "Slug must be unique" }, updatedAt: Date.now() };
    }
    return { ok: false, message: "Failed to update project", updatedAt: Date.now() };
  }
}

export async function archiveProject(projectId: string): Promise<ActionResult> {
  try {
    const trashedCheck = await ensureNotTrashed(projectId);
    if (trashedCheck) return trashedCheck;

    await prisma.project.update({ where: { id: projectId }, data: { isArchived: true, archivedAt: new Date() } });
    await prisma.projectActivity.create({
      data: { projectId, type: "ARCHIVED", message: "Project archived" },
    });
    revalidate(projectId);
    return { ok: true, message: "Project archived", nonce: Date.now().toString() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to archive project", nonce: Date.now().toString() };
  }
}

export async function unarchiveProject(projectId: string): Promise<ActionResult> {
  try {
    await prisma.project.update({ where: { id: projectId }, data: { isArchived: false, archivedAt: null } });
    await prisma.projectActivity.create({
      data: { projectId, type: "UNARCHIVED", message: "Project unarchived" },
    });
    revalidate(projectId);
    return { ok: true, message: "Project unarchived", nonce: Date.now().toString() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to unarchive project", nonce: Date.now().toString() };
  }
}

export async function softDeleteProject(projectId: string, reason?: string): Promise<ActionResult> {
  try {
    const parsed = idSchema.safeParse({ projectId, reason });
    if (!parsed.success) {
      const { message } = mapFieldErrors(parsed.error);
      return { ok: false, message: message || "Invalid input", nonce: Date.now().toString() };
    }
    const trashedCheck = await ensureNotTrashed(projectId);
    if (trashedCheck) return trashedCheck;

    await prisma.project.update({ where: { id: projectId }, data: { deletedAt: new Date() } });
    await prisma.projectActivity.create({
      data: { projectId, type: "TRASHED", message: "Project moved to Trash" },
    });
    revalidate(projectId);
    return { ok: true, message: "Project moved to Trash", nonce: Date.now().toString() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to move to Trash", nonce: Date.now().toString() };
  }
}

export async function restoreProject(projectId: string): Promise<ActionResult> {
  try {
    await prisma.project.update({ where: { id: projectId }, data: { deletedAt: null } });
    await prisma.projectActivity.create({
      data: { projectId, type: "RESTORED", message: "Project restored from Trash" },
    });
    revalidate(projectId);
    return { ok: true, message: "Project restored", nonce: Date.now().toString() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to restore project", nonce: Date.now().toString() };
  }
}

export async function deleteProjectPermanently(projectId: string): Promise<ActionResult> {
  try {
    const parsed = idSchema.pick({ projectId: true }).safeParse({ projectId });
    if (!parsed.success) {
      const { message } = mapFieldErrors(parsed.error);
      return { ok: false, message: message || "Invalid input", nonce: Date.now().toString() };
    }
    const existing = await prisma.project.findUnique({ where: { id: projectId }, select: { deletedAt: true } });
    if (!existing) return { ok: false, message: "Project not found", nonce: Date.now().toString() };
    if (!existing.deletedAt)
      return { ok: false, message: "Move to Trash before permanently deleting.", nonce: Date.now().toString() };

    await prisma.project.delete({ where: { id: projectId } });
    revalidate();
    return { ok: true, message: "Project permanently deleted", nonce: Date.now().toString() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to permanently delete project", nonce: Date.now().toString() };
  }
}

export async function updateProjectStatus(projectId: string, status: string): Promise<ActionResult> {
  try {
    const trashedCheck = await ensureNotTrashed(projectId);
    if (trashedCheck) return trashedCheck;

    const parsed = z.enum(ProjectStatusValues).safeParse(status);
    if (!parsed.success) return { ok: false, message: "Invalid status", nonce: Date.now().toString() };

    await prisma.project.update({ where: { id: projectId }, data: { status: parsed.data } });
    await prisma.projectActivity.create({
      data: { projectId, type: "STATUS_UPDATED", message: `Status set to ${parsed.data}` },
    });
    revalidate(projectId);
    return { ok: true, message: "Status updated", nonce: Date.now().toString() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to update status", nonce: Date.now().toString() };
  }
}

const datesSchema = z
  .object({
    startDate: z.string().optional(),
    deadline: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.deadline) {
        return new Date(data.startDate) <= new Date(data.deadline);
      }
      return true;
    },
    { path: ["deadline"], message: "Deadline must be on or after start date" }
  );

export async function setProjectDates(projectId: string, startDate?: string, deadline?: string): Promise<ActionResult> {
  try {
    const trashedCheck = await ensureNotTrashed(projectId);
    if (trashedCheck) return trashedCheck;

    const parsed = datesSchema.safeParse({ startDate, deadline });
    if (!parsed.success) {
      const { fieldErrors, message } = mapFieldErrors(parsed.error);
      return { ok: false, message, fieldErrors, nonce: Date.now().toString() };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      },
    });
    await prisma.projectActivity.create({
      data: { projectId, type: "DATES_UPDATED", message: "Project dates updated" },
    });
    revalidate(projectId);
    return { ok: true, message: "Dates updated", nonce: Date.now().toString() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to update dates", nonce: Date.now().toString() };
  }
}

export async function duplicateProject(projectId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { requirements: true, milestones: true },
    });
    if (!project) return { ok: false, message: "Project not found" };

    const duplicate = await prisma.project.create({
      data: {
        name: `${project.name} Copy`,
        slug: `${project.slug}-copy-${Date.now()}`,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        status: "PLANNING",
        startDate: project.startDate,
        deadline: project.deadline,
        techStack: project.techStack,
        repoUrl: project.repoUrl,
        stagingUrl: project.stagingUrl,
        productionUrl: project.productionUrl,
        scopeSummary: project.scopeSummary,
        isArchived: false,
        sortOrder: project.sortOrder + 1,
        requirements: {
          create: project.requirements.map((r) => ({
            group: r.group,
            label: r.label,
            isDone: false,
            sortOrder: r.sortOrder,
          })),
        },
        milestones: {
          create: project.milestones.map((m) => ({
            title: m.title,
            status: "NOT_STARTED",
            dueDate: m.dueDate,
            sortOrder: m.sortOrder,
          })),
        },
      },
    });
    await prisma.projectActivity.create({
      data: { projectId: duplicate.id, type: "CREATED", message: "Project duplicated" },
    });
    revalidate(duplicate.id);
    return { ok: true, data: { id: duplicate.id }, message: "Project duplicated" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to duplicate project" };
  }
}
