import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string; taskId: string } }) {

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(prisma as any).projectTask?.findUnique) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.projectTask.findUnique({
      where: { id: params.taskId },
      include: { project: true },
    });
    if (!task || task.projectId !== params.projectId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.project.clientId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const isCompletedByClient = Boolean(body?.isCompletedByClient);

    if (!(prisma as any).projectTask?.update) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const updated = await prisma.projectTask.update({
      where: { id: params.taskId },
      data: { isCompletedByClient },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating portal task", error);
    return NextResponse.json({ error: "Unable to update task" }, { status: 500 });
  }
}
