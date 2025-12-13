import { NextRequest, NextResponse } from "next/server";
function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");
    if (!(prisma as any).project?.findMany) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });
    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error("Error fetching projects", error);
    return NextResponse.json({ error: "Unable to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
    const body = await req.json();
    const name = body?.name as string | undefined;
    const clientId = body?.clientId as string | undefined;
    if (!name || !clientId) {
      return NextResponse.json({ error: "Name and clientId are required." }, { status: 400 });
    }

    const slug = slugify(name);

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        clientId,
        summary: body?.summary ?? null,
        type: body?.type ?? null,
        status: body?.status ?? undefined,
        startDate: body?.startDate ? new Date(body.startDate) : null,
        dueDate: body?.dueDate ? new Date(body.dueDate) : null,
        sourceType: body?.sourceType ?? "MANUAL",
        sourceId: body?.sourceId ?? null,
      },
      include: { client: true },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project", error);
    return NextResponse.json({ error: "Unable to create project" }, { status: 500 });
  }
}
