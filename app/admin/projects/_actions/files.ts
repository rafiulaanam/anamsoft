"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { FileLinkSchema, type ActionResult } from "@/lib/validators/project";

function mapFieldErrors(error: any) {
  if (!error?.flatten) return undefined;
  const flat = error.flatten();
  const fieldErrors: Record<string, string> = {};
  Object.entries(flat.fieldErrors || {}).forEach(([key, messages]) => {
    const msgs = messages as string[] | undefined;
    if (msgs && msgs.length > 0) {
      fieldErrors[key] = msgs[0];
    }
  });
  return Object.keys(fieldErrors).length ? fieldErrors : undefined;
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

export async function addProjectFileLink(projectId: string, data: FormData): Promise<ActionResult> {
  const trashedCheck = await ensureProjectActive(projectId);
  if (trashedCheck) return trashedCheck;

  const parsed = FileLinkSchema.safeParse({
    name: (data.get("name") as string) ?? "",
    url: (data.get("url") as string) ?? "",
    type: (data.get("type") as string) ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the errors.", fieldErrors: mapFieldErrors(parsed.error) };
  }
  try {
    await prisma.projectFile.create({
      data: { ...parsed.data, projectId },
    });
    await prisma.projectActivity.create({
      data: { projectId, type: "FILE_ADDED", message: `Added file ${parsed.data.name}` },
    });
    revalidate(projectId);
    return { ok: true, message: "File added" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to add file" };
  }
}

export async function deleteProjectFileLink(fileId: string): Promise<ActionResult> {
  try {
    const file = await prisma.projectFile.findUnique({
      where: { id: fileId },
      select: { id: true, projectId: true, name: true, project: { select: { deletedAt: true } } },
    });
    if (!file) return { ok: false, message: "File not found" };
    if (file.project.deletedAt) return { ok: false, message: "This project is in Trash. Restore it to edit." };

    await prisma.projectFile.delete({ where: { id: fileId } });
    await prisma.projectActivity.create({
      data: { projectId: file.projectId, type: "FILE_REMOVED", message: `Removed file ${file.name}` },
    });
    revalidate(file.projectId);
    return { ok: true, message: "File removed" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to remove file" };
  }
}
