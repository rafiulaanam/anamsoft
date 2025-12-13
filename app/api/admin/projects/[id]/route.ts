import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  // Avoid DB work during static build on Vercel.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return NextResponse.json({ data: null }, { status: 200 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        tasks: { orderBy: { order: "asc" } },
        updates: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Error fetching project", error);
    return NextResponse.json({ error: "Unable to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Avoid DB work during static build on Vercel.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return NextResponse.json({ data: null }, { status: 200 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const body = await req.json();
    const data: any = {};
    if (typeof body.name === "string") data.name = body.name;
    if (typeof body.summary === "string") data.summary = body.summary;
    if (typeof body.type === "string") data.type = body.type;
    if (typeof body.status === "string") data.status = body.status;
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.dueDate) data.dueDate = new Date(body.dueDate);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: {
        client: true,
        tasks: { orderBy: { order: "asc" } },
        updates: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Error updating project", error);
    return NextResponse.json({ error: "Unable to update project" }, { status: 500 });
  }
}
