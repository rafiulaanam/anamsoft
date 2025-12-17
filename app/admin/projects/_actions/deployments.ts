"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ActionResult } from "@/lib/validators/project";

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

export async function addDeploymentLog(
  projectId: string,
  data: { environment: "STAGING" | "PRODUCTION"; versionTag?: string; notes?: string }
): Promise<ActionResult> {
  try {
    const trashedCheck = await ensureProjectActive(projectId);
    if (trashedCheck) return trashedCheck;

    await prisma.projectDeployment.create({
      data: {
        projectId,
        environment: data.environment,
        versionTag: data.versionTag,
        notes: data.notes,
      },
    });
    await prisma.projectActivity.create({
      data: { projectId, type: "DEPLOYMENT", message: `Deployment logged (${data.environment})` },
    });
    revalidate(projectId);
    return { ok: true, message: "Deployment added" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to add deployment" };
  }
}
