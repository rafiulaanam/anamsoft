import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tasks = await prisma.projectTask.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error("Error fetching tasks", error);
    return NextResponse.json({ error: "Unable to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const title = body?.title as string | undefined;
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId: params.id,
        title,
        description: body?.description ?? null,
        isRequired: body?.isRequired ?? true,
        order: body?.order ?? 0,
      },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task", error);
    return NextResponse.json({ error: "Unable to create task" }, { status: 500 });
  }
}
