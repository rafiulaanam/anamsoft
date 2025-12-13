import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {

  try {
    const { prisma } = await import("@/lib/db");
    if (!(prisma as any).projectUpdate?.findMany) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }
    const updates = await prisma.projectUpdate.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: updates });
  } catch (error) {
    console.error("Error fetching updates", error);
    return NextResponse.json({ error: "Unable to fetch updates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { prisma } = await import("@/lib/db");
    const body = await req.json();
    const title = body?.title as string | undefined;
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (!(prisma as any).project?.findUnique || !(prisma as any).projectUpdate?.create) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const update = await prisma.projectUpdate.create({
      data: {
        projectId: params.id,
        title,
        message: body?.message ?? "",
        createdBy: body?.createdBy ?? "Admin",
      },
    });

    return NextResponse.json({ data: update }, { status: 201 });
  } catch (error) {
    console.error("Error creating update", error);
    return NextResponse.json({ error: "Unable to create update" }, { status: 500 });
  }
}
